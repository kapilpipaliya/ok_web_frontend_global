/**
 * Node Registry
 *
 * Manages node registration, discovery, and heartbeat in the cluster
 */

import { hostname } from "node:os";
import Redis from "ioredis";
import {
  CLUSTER_CHANNELS,
  CLUSTER_KEYS,
  DEFAULT_CLUSTER_CONFIG,
  type NodeId,
  type NodeInfo,
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
 * Generates a unique node ID
 * Format: {hostname}-{pid}-{timestamp}
 */
function generateNodeId(): NodeId {
  return `${hostname()}-${process.pid}-${Date.now()}`;
}

/**
 * Node Registry for cluster node management
 */
export class NodeRegistry {
  private nodeId: NodeId;
  private redis: Redis | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private nodeInfo: NodeInfo;

  constructor() {
    this.nodeId = generateNodeId();
    this.nodeInfo = {
      nodeId: this.nodeId,
      hostname: hostname(),
      pid: process.pid,
      startedAt: Date.now(),
      lastHeartbeat: Date.now(),
    };
  }

  /**
   * Get the current node ID
   */
  getNodeId(): NodeId {
    return this.nodeId;
  }

  /**
   * Get the current node info
   */
  getNodeInfo(): NodeInfo {
    return { ...this.nodeInfo };
  }

  /**
   * Initialize the node registry
   * Registers this node and starts heartbeat
   */
  async initialize(): Promise<void> {
    try {
      this.redis = new Redis(getRedisConnection());

      this.redis.on("error", (error) => {
        console.error("[NodeRegistry] Redis error:", error);
      });

      // Register this node
      await this.registerNode();

      // Start heartbeat
      this.startHeartbeat();

      // Listen for shutdown signals to unregister
      process.on("beforeExit", () => this.shutdown());

      console.log(
        `[NodeRegistry] Node registered: ${this.nodeId} (${this.nodeInfo.hostname})`,
      );
    } catch (error) {
      console.error("[NodeRegistry] Failed to initialize:", error);
      throw error;
    }
  }

  /**
   * Register this node in Redis with TTL
   */
  private async registerNode(): Promise<void> {
    if (!this.redis) return;

    try {
      const nodeKey = CLUSTER_KEYS.NODE_INFO(this.nodeId);
      const ttlSeconds = Math.ceil(DEFAULT_CLUSTER_CONFIG.nodeTTL / 1000);

      // Store node info with TTL
      await this.redis.setex(
        nodeKey,
        ttlSeconds,
        JSON.stringify(this.nodeInfo),
      );

      // Add to node registry set
      await this.redis.sadd(CLUSTER_KEYS.NODE_REGISTRY, this.nodeId);

      console.log(`[NodeRegistry] Node registered with TTL: ${ttlSeconds}s`);
    } catch (error) {
      console.error("[NodeRegistry] Failed to register node:", error);
    }
  }

  /**
   * Start sending periodic heartbeats
   */
  private startHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.heartbeatInterval = setInterval(async () => {
      await this.sendHeartbeat();
    }, DEFAULT_CLUSTER_CONFIG.heartbeatInterval);

    // Send first heartbeat immediately
    this.sendHeartbeat();
  }

  /**
   * Send heartbeat to refresh node registration
   */
  private async sendHeartbeat(): Promise<void> {
    if (!this.redis) return;

    try {
      this.nodeInfo.lastHeartbeat = Date.now();

      const nodeKey = CLUSTER_KEYS.NODE_INFO(this.nodeId);
      const ttlSeconds = Math.ceil(DEFAULT_CLUSTER_CONFIG.nodeTTL / 1000);

      // Refresh node info with updated heartbeat
      await this.redis.setex(
        nodeKey,
        ttlSeconds,
        JSON.stringify(this.nodeInfo),
      );

      // Refresh membership in registry set
      await this.redis.sadd(CLUSTER_KEYS.NODE_REGISTRY, this.nodeId);

      console.log(`[NodeRegistry] Heartbeat sent: ${this.nodeId}`);
    } catch (error) {
      console.error("[NodeRegistry] Failed to send heartbeat:", error);
    }
  }

  /**
   * Get all active nodes in the cluster
   */
  async getActiveNodes(): Promise<NodeInfo[]> {
    if (!this.redis) return [this.nodeInfo];

    try {
      // Get all node IDs from registry
      const nodeIds = await this.redis.smembers(CLUSTER_KEYS.NODE_REGISTRY);

      // Fetch info for each node
      const nodes: NodeInfo[] = [];

      for (const nodeId of nodeIds) {
        const nodeKey = CLUSTER_KEYS.NODE_INFO(nodeId);
        const nodeData = await this.redis.get(nodeKey);

        if (nodeData) {
          try {
            const nodeInfo: NodeInfo = JSON.parse(nodeData);
            nodes.push(nodeInfo);
          } catch (parseError) {
            console.error(
              `[NodeRegistry] Failed to parse node info for ${nodeId}:`,
              parseError,
            );
          }
        } else {
          // Node data expired but still in registry set, remove it
          await this.redis.srem(CLUSTER_KEYS.NODE_REGISTRY, nodeId);
        }
      }

      return nodes;
    } catch (error) {
      console.error("[NodeRegistry] Failed to get active nodes:", error);
      return [this.nodeInfo]; // Return at least current node
    }
  }

  /**
   * Get the count of active nodes
   */
  async getActiveNodeCount(): Promise<number> {
    const nodes = await this.getActiveNodes();
    return nodes.length;
  }

  /**
   * Check if a specific node is active
   */
  async isNodeActive(nodeId: NodeId): Promise<boolean> {
    if (!this.redis) return nodeId === this.nodeId;

    try {
      const nodeKey = CLUSTER_KEYS.NODE_INFO(nodeId);
      const exists = await this.redis.exists(nodeKey);
      return exists === 1;
    } catch (error) {
      console.error(`[NodeRegistry] Failed to check node ${nodeId}:`, error);
      return false;
    }
  }

  /**
   * Get info for a specific node by node ID
   */
  async getNodeInfoById(nodeId: NodeId): Promise<NodeInfo | null> {
    if (!this.redis) {
      return nodeId === this.nodeId ? this.nodeInfo : null;
    }

    try {
      const nodeKey = CLUSTER_KEYS.NODE_INFO(nodeId);
      const nodeData = await this.redis.get(nodeKey);

      if (!nodeData) return null;

      return JSON.parse(nodeData);
    } catch (error) {
      console.error(
        `[NodeRegistry] Failed to get node info for ${nodeId}:`,
        error,
      );
      return null;
    }
  }

  /**
   * Clean up stale nodes from registry
   * Removes nodes whose data has expired
   */
  async cleanupStaleNodes(): Promise<number> {
    if (!this.redis) return 0;

    try {
      const nodeIds = await this.redis.smembers(CLUSTER_KEYS.NODE_REGISTRY);
      let removedCount = 0;

      for (const nodeId of nodeIds) {
        const nodeKey = CLUSTER_KEYS.NODE_INFO(nodeId);
        const exists = await this.redis.exists(nodeKey);

        if (exists === 0) {
          // Node data expired, remove from registry
          await this.redis.srem(CLUSTER_KEYS.NODE_REGISTRY, nodeId);
          removedCount++;
          console.log(`[NodeRegistry] Removed stale node: ${nodeId}`);
        }
      }

      if (removedCount > 0) {
        console.log(`[NodeRegistry] Cleaned up ${removedCount} stale node(s)`);
      }

      return removedCount;
    } catch (error) {
      console.error("[NodeRegistry] Failed to cleanup stale nodes:", error);
      return 0;
    }
  }

  /**
   * Gracefully shutdown this node
   * Unregisters from cluster and stops heartbeat
   */
  async shutdown(): Promise<void> {
    console.log(`[NodeRegistry] Shutting down node: ${this.nodeId}`);

    // Stop heartbeat
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    // Unregister node
    if (this.redis) {
      try {
        // Broadcast shutdown notification
        await this.redis.publish(
          CLUSTER_CHANNELS.NODE_SHUTDOWN,
          JSON.stringify({
            nodeId: this.nodeId,
            timestamp: Date.now(),
          }),
        );

        // Remove from registry
        await this.redis.srem(CLUSTER_KEYS.NODE_REGISTRY, this.nodeId);

        // Delete node info
        const nodeKey = CLUSTER_KEYS.NODE_INFO(this.nodeId);
        await this.redis.del(nodeKey);

        console.log(`[NodeRegistry] Node unregistered: ${this.nodeId}`);

        // Close Redis connection
        await this.redis.quit();
        this.redis = null;
      } catch (error) {
        console.error("[NodeRegistry] Error during shutdown:", error);
      }
    }
  }
}
