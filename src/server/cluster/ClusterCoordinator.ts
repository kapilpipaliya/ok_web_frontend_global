/**
 * Cluster Coordinator
 *
 * Handles request-response pattern for cluster-wide operations
 * Manages acknowledgments, timeouts, and response aggregation
 */

import { randomUUID } from "node:crypto";
import Redis from "ioredis";
import type { NodeRegistry } from "./NodeRegistry";
import {
  CLUSTER_KEYS,
  DEFAULT_CLUSTER_CONFIG,
  type ClusterConfig,
  type ClusterMessage,
  type ClusterOperationResult,
  type NodeId,
  type RequestId,
} from "./types";

// Redis connection configuration
function getRedisConnection() {
  return {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  };
}

/**
 * Tracks pending requests and their responses
 */
interface PendingRequest<T> {
  requestId: RequestId;
  startTime: number;
  expectedNodes: Set<NodeId>;
  responses: Map<NodeId, T>;
  errors: Map<NodeId, string>;
  resolvers: Array<(value: ClusterOperationResult<T>) => void>;
  timeoutId: NodeJS.Timeout;
}

/**
 * Cluster Coordinator for managing distributed operations
 */
export class ClusterCoordinator {
  private publisher: Redis | null = null;
  private subscriber: Redis | null = null;
  private pendingRequests = new Map<RequestId, PendingRequest<any>>();
  private nodeRegistry: NodeRegistry;
  private config: ClusterConfig;

  constructor(nodeRegistry: NodeRegistry, config?: Partial<ClusterConfig>) {
    this.nodeRegistry = nodeRegistry;
    this.config = { ...DEFAULT_CLUSTER_CONFIG, ...config };
  }

  /**
   * Initialize the coordinator
   */
  async initialize(): Promise<void> {
    try {
      const connection = getRedisConnection();

      // Create publisher connection
      this.publisher = new Redis(connection);

      // Create subscriber connection (separate required for pub/sub)
      this.subscriber = new Redis(connection);

      this.publisher.on("error", (error) => {
        console.error("[ClusterCoordinator] Publisher error:", error);
      });

      this.subscriber.on("error", (error) => {
        console.error("[ClusterCoordinator] Subscriber error:", error);
      });

      // Subscribe to response channels (will be done per-request)
      this.subscriber.on("pmessage", (pattern, channel, message) => {
        this.handleResponse(channel, message);
      });

      // Subscribe to all response channels using pattern
      await this.subscriber.psubscribe("cluster:*:response:*");

      console.log("[ClusterCoordinator] Initialized successfully");
    } catch (error) {
      console.error("[ClusterCoordinator] Failed to initialize:", error);
      throw error;
    }
  }

  /**
   * Send a request to all nodes and wait for responses
   */
  async broadcastAndWait<TRequest extends ClusterMessage, TResponse>(
    channel: string,
    request: Omit<TRequest, "requestId" | "sourceNodeId" | "timestamp">,
    timeout?: number,
  ): Promise<ClusterOperationResult<TResponse>> {
    if (!this.publisher) {
      throw new Error("ClusterCoordinator not initialized");
    }

    // Generate request ID
    const requestId = randomUUID();
    const sourceNodeId = this.nodeRegistry.getNodeId();

    // Get all active nodes (excluding self)
    const allNodes = await this.nodeRegistry.getActiveNodes();
    const expectedNodes = allNodes
      .filter((node) => node.nodeId !== sourceNodeId)
      .map((node) => node.nodeId);

    // If no other nodes, return early
    if (expectedNodes.length === 0) {
      console.log(
        `[ClusterCoordinator] No other nodes to broadcast to for request: ${requestId}`,
      );
      return {
        success: true,
        requestId,
        totalNodes: 0,
        respondedNodes: 0,
        timedOutNodes: 0,
        responses: new Map(),
        errors: new Map(),
        duration: 0,
      };
    }

    // Create pending request tracker
    const pending: PendingRequest<TResponse> = {
      requestId,
      startTime: Date.now(),
      expectedNodes: new Set(expectedNodes),
      responses: new Map(),
      errors: new Map(),
      resolvers: [],
      timeoutId: setTimeout(() => {
        this.handleTimeout(requestId);
      }, timeout || this.config.operationTimeout),
    };

    this.pendingRequests.set(requestId, pending);

    // Store request in Redis for tracking
    const requestKey = CLUSTER_KEYS.PENDING_REQUEST(requestId);
    await this.publisher.setex(
      requestKey,
      Math.ceil(this.config.requestTTL / 1000),
      JSON.stringify({
        channel,
        request,
        expectedNodes,
        startTime: pending.startTime,
      }),
    );

    // Build full message
    const fullMessage: TRequest = {
      ...request,
      requestId,
      sourceNodeId,
      timestamp: Date.now(),
    } as TRequest;

    // Publish request
    await this.publisher.publish(channel, JSON.stringify(fullMessage));

    console.log(
      `[ClusterCoordinator] Broadcasted request ${requestId} to ${expectedNodes.length} node(s)`,
    );

    // Wait for responses
    return new Promise((resolve) => {
      pending.resolvers.push(resolve);
    });
  }

  /**
   * Send a response to a request
   */
  async sendResponse<TResponse extends ClusterMessage>(
    responseChannel: string,
    requestId: RequestId,
    response: Omit<TResponse, "requestId" | "sourceNodeId" | "timestamp">,
  ): Promise<void> {
    if (!this.publisher) {
      throw new Error("ClusterCoordinator not initialized");
    }

    const fullResponse: TResponse = {
      ...response,
      requestId,
      sourceNodeId: this.nodeRegistry.getNodeId(),
      timestamp: Date.now(),
    } as TResponse;

    const channel = `${responseChannel}:${requestId}`;

    await this.publisher.publish(channel, JSON.stringify(fullResponse));

    console.log(`[ClusterCoordinator] Sent response for request: ${requestId}`);
  }

  /**
   * Handle incoming response
   */
  private handleResponse(channel: string, message: string): void {
    try {
      // Extract requestId from channel: cluster:xxx:response:{requestId}
      const parts = channel.split(":");
      const requestId = parts[parts.length - 1];

      const pending = this.pendingRequests.get(requestId);
      if (!pending) {
        // Request already completed or timed out
        return;
      }

      const response = JSON.parse(message);
      const nodeId: NodeId = response.sourceNodeId;

      // Check if we were expecting response from this node
      if (!pending.expectedNodes.has(nodeId)) {
        console.warn(
          `[ClusterCoordinator] Unexpected response from node ${nodeId} for request ${requestId}`,
        );
        return;
      }

      // Store response
      if (response.success === false || response.error) {
        pending.errors.set(nodeId, response.error || "Unknown error");
        console.warn(
          `[ClusterCoordinator] Error response from ${nodeId}: ${response.error}`,
        );
      } else {
        pending.responses.set(nodeId, response);
        console.log(
          `[ClusterCoordinator] Response received from ${nodeId} (${pending.responses.size}/${pending.expectedNodes.size})`,
        );
      }

      // Check if all nodes responded
      const totalResponded = pending.responses.size + pending.errors.size;
      if (totalResponded >= pending.expectedNodes.size) {
        this.completeRequest(requestId);
      }
    } catch (error) {
      console.error("[ClusterCoordinator] Error handling response:", error);
    }
  }

  /**
   * Handle request timeout
   */
  private handleTimeout(requestId: RequestId): void {
    const pending = this.pendingRequests.get(requestId);
    if (!pending) return;

    const totalResponded = pending.responses.size + pending.errors.size;
    const timedOutNodes = pending.expectedNodes.size - totalResponded;

    console.warn(
      `[ClusterCoordinator] Request ${requestId} timed out. ` +
        `Received ${totalResponded}/${pending.expectedNodes.size} responses. ` +
        `${timedOutNodes} node(s) did not respond.`,
    );

    // Add timeout errors for non-responsive nodes
    for (const nodeId of pending.expectedNodes) {
      if (!(pending.responses.has(nodeId) || pending.errors.has(nodeId))) {
        pending.errors.set(nodeId, "Response timeout");
      }
    }

    this.completeRequest(requestId);
  }

  /**
   * Complete a pending request
   */
  private completeRequest(requestId: RequestId): void {
    const pending = this.pendingRequests.get(requestId);
    if (!pending) return;

    // Clear timeout
    clearTimeout(pending.timeoutId);

    // Calculate duration
    const duration = Date.now() - pending.startTime;

    // Build result
    const totalResponded = pending.responses.size + pending.errors.size;
    const timedOutNodes = pending.expectedNodes.size - totalResponded;

    const result: ClusterOperationResult = {
      success:
        pending.responses.size > 0 &&
        (this.config.requireAllNodes ? pending.errors.size === 0 : true),
      requestId,
      totalNodes: pending.expectedNodes.size,
      respondedNodes: totalResponded,
      timedOutNodes,
      responses: pending.responses,
      errors: pending.errors,
      duration,
    };

    // Resolve all waiting promises
    for (const resolver of pending.resolvers) {
      resolver(result);
    }

    // Cleanup
    this.pendingRequests.delete(requestId);

    console.log(
      `[ClusterCoordinator] Request ${requestId} completed in ${duration}ms. ` +
        `Success: ${result.success}, Responses: ${pending.responses.size}/${pending.expectedNodes.size}`,
    );
  }

  /**
   * Get statistics about pending requests
   */
  getPendingRequestCount(): number {
    return this.pendingRequests.size;
  }

  /**
   * Get details of all pending requests
   */
  getPendingRequests(): Array<{
    requestId: RequestId;
    age: number;
    expectedNodes: number;
    responseCount: number;
    errorCount: number;
  }> {
    const now = Date.now();
    return Array.from(this.pendingRequests.entries()).map(
      ([requestId, pending]) => ({
        requestId,
        age: now - pending.startTime,
        expectedNodes: pending.expectedNodes.size,
        responseCount: pending.responses.size,
        errorCount: pending.errors.size,
      }),
    );
  }

  /**
   * Clean up stale pending requests
   */
  async cleanup(): Promise<void> {
    const now = Date.now();
    const maxAge = this.config.operationTimeout * 2; // 2x timeout

    for (const [requestId, pending] of this.pendingRequests.entries()) {
      if (now - pending.startTime > maxAge) {
        console.warn(
          `[ClusterCoordinator] Cleaning up stale request: ${requestId}`,
        );
        clearTimeout(pending.timeoutId);
        this.pendingRequests.delete(requestId);
      }
    }
  }

  /**
   * Gracefully shutdown the coordinator
   */
  async shutdown(): Promise<void> {
    console.log("[ClusterCoordinator] Shutting down...");

    // Complete all pending requests with errors
    for (const [requestId, pending] of this.pendingRequests.entries()) {
      clearTimeout(pending.timeoutId);

      // Add shutdown errors for all expected nodes
      for (const nodeId of pending.expectedNodes) {
        if (!(pending.responses.has(nodeId) || pending.errors.has(nodeId))) {
          pending.errors.set(nodeId, "Coordinator shutting down");
        }
      }

      this.completeRequest(requestId);
    }

    // Close Redis connections
    if (this.subscriber) {
      await this.subscriber.quit();
      this.subscriber = null;
    }

    if (this.publisher) {
      await this.publisher.quit();
      this.publisher = null;
    }

    console.log("[ClusterCoordinator] Shutdown complete");
  }
}
