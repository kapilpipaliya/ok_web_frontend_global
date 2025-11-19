/**
 * Cluster Communication Module
 *
 * Provides Redis pub/sub based communication between cluster nodes
 * with acknowledgments and proper coordination
 */

import Redis from "ioredis";
import {
  initSubdomainWorkersForSubdomain,
  stopWorkersForSubdomain,
  workerState,
} from "~/server/queue/initWorkersCore";
import { startWorkerForSubdomainCore } from "~/server/queue/initWorkers";
import { ClusterCoordinator } from "./ClusterCoordinator";
import { NodeRegistry } from "./NodeRegistry";
import {
  CLUSTER_CHANNELS,
  type ClusterOperationResult,
  type StartWorkersRequest,
  type StartWorkersResponse,
  type StopWorkersRequest,
  type StopWorkersResponse,
  type WorkerInfo,
  type WorkerStatusRequest,
  type WorkerStatusResponse,
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

// Global state for cluster communication
declare global {
  var __clusterState:
    | {
        nodeRegistry: NodeRegistry | null;
        coordinator: ClusterCoordinator | null;
        subscriber: Redis | null;
        initialized: boolean;
      }
    | undefined;
}

if (!global.__clusterState) {
  global.__clusterState = {
    nodeRegistry: null,
    coordinator: null,
    subscriber: null,
    initialized: false,
  };
}

export const clusterState = global.__clusterState;

/**
 * Initialize cluster communication
 * Sets up node registry, coordinator, and message handlers
 */
export async function initClusterCommunication() {
  if (clusterState.initialized) {
    console.log("[Cluster] Already initialized");
    return;
  }

  try {
    // Initialize node registry
    clusterState.nodeRegistry = new NodeRegistry();
    await clusterState.nodeRegistry.initialize();

    // Initialize cluster coordinator
    clusterState.coordinator = new ClusterCoordinator(
      clusterState.nodeRegistry,
    );
    await clusterState.coordinator.initialize();

    // Create subscriber for command channels
    clusterState.subscriber = new Redis(getRedisConnection());

    // Subscribe to command channels
    await clusterState.subscriber.subscribe(
      CLUSTER_CHANNELS.STOP_WORKERS,
      CLUSTER_CHANNELS.START_WORKERS,
      CLUSTER_CHANNELS.WORKER_STATUS_REQUEST,
    );

    // Handle incoming commands
    clusterState.subscriber.on("message", async (channel, message) => {
      try {
        await handleClusterMessage(channel, message);
      } catch (error) {
        console.error(
          `[Cluster] Error processing message on ${channel}:`,
          error,
        );
      }
    });

    clusterState.subscriber.on("error", (error) => {
      console.error("[Cluster] Subscriber error:", error);
    });

    clusterState.initialized = true;
    console.log("[Cluster] Communication initialized successfully");
  } catch (error) {
    console.error(
      "[Cluster] Failed to initialize cluster communication:",
      error,
    );
    // Don't throw - allow app to continue even if cluster communication fails
  }
}

/**
 * Handle incoming cluster messages
 */
async function handleClusterMessage(
  channel: string,
  message: string,
): Promise<void> {
  const data = JSON.parse(message);
  const { requestId, sourceNodeId } = data;

  // Skip if message is from this node
  if (
    clusterState.nodeRegistry &&
    sourceNodeId === clusterState.nodeRegistry.getNodeId()
  ) {
    return;
  }

  console.log(
    `[Cluster] Received command on ${channel} from node ${sourceNodeId}`,
  );

  switch (channel) {
    case CLUSTER_CHANNELS.STOP_WORKERS:
      await handleStopWorkersRequest(data as StopWorkersRequest);
      break;

    case CLUSTER_CHANNELS.START_WORKERS:
      await handleStartWorkersRequest(data as StartWorkersRequest);
      break;

    case CLUSTER_CHANNELS.WORKER_STATUS_REQUEST:
      await handleWorkerStatusRequest(data as WorkerStatusRequest);
      break;

    default:
      console.warn(`[Cluster] Unknown channel: ${channel}`);
  }
}

/**
 * Handle stop workers request
 */
async function handleStopWorkersRequest(
  request: StopWorkersRequest,
): Promise<void> {
  const { requestId, subdomain, workerKey } = request;

  try {
    const workerInfo = workerKey ? ` worker: ${workerKey}` : " all workers";
    console.log(
      `[Cluster] Stopping${workerInfo} for subdomain: ${subdomain} (request: ${requestId})`,
    );

    let workersStopped = 0;

    if (workerKey) {
      // Stop a specific worker
      const subdomainWorkers = workerState.activeWorkers.get(subdomain);
      const worker = subdomainWorkers?.get(workerKey);

      if (worker) {
        await worker.stop();
        subdomainWorkers!.delete(workerKey);
        workersStopped = 1;

        // Clean up if no more workers
        if (subdomainWorkers!.size === 0) {
          workerState.activeWorkers.delete(subdomain);
        }
      }
    } else {
      // Stop all workers for subdomain
      await stopWorkersForSubdomain(subdomain);
      workersStopped = 0; // Workers are already stopped, can't count them
    }

    // Send success response
    if (clusterState.coordinator) {
      await clusterState.coordinator.sendResponse<StopWorkersResponse>(
        CLUSTER_CHANNELS.STOP_WORKERS_RESPONSE,
        requestId,
        {
          subdomain,
          success: true,
          workersStopped,
        },
      );
    }

    console.log(
      `[Cluster]${workerInfo} stopped successfully for subdomain: ${subdomain}`,
    );
  } catch (error) {
    console.error(`[Cluster] Error stopping workers for ${subdomain}:`, error);

    // Send error response
    if (clusterState.coordinator) {
      await clusterState.coordinator.sendResponse<StopWorkersResponse>(
        CLUSTER_CHANNELS.STOP_WORKERS_RESPONSE,
        requestId,
        {
          subdomain,
          success: false,
          error: error instanceof Error ? error.message : String(error),
          workersStopped: 0,
        },
      );
    }
  }
}

/**
 * Handle start workers request
 */
async function handleStartWorkersRequest(
  request: StartWorkersRequest,
): Promise<void> {
  const { requestId, subdomain, workerKey } = request;

  try {
    const workerInfo = workerKey ? ` worker: ${workerKey}` : " all workers";
    console.log(
      `[Cluster] Starting${workerInfo} for subdomain: ${subdomain} (request: ${requestId})`,
    );

    let workersStarted = 0;

    if (workerKey) {
      // Start a specific worker
      const result = await startWorkerForSubdomainCore(subdomain, workerKey);
      if (result.success) {
        workersStarted = 1;
      }
    } else {
      // Start all workers for subdomain
      await initSubdomainWorkersForSubdomain(subdomain);

      // Count workers that were started
      const subdomainWorkers = workerState.activeWorkers.get(subdomain);
      workersStarted = subdomainWorkers ? subdomainWorkers.size : 0;
    }

    // Send success response
    if (clusterState.coordinator) {
      await clusterState.coordinator.sendResponse<StartWorkersResponse>(
        CLUSTER_CHANNELS.START_WORKERS_RESPONSE,
        requestId,
        {
          subdomain,
          success: true,
          workersStarted,
        },
      );
    }

    console.log(
      `[Cluster]${workerInfo} started successfully for subdomain: ${subdomain} (count: ${workersStarted})`,
    );
  } catch (error) {
    console.error(`[Cluster] Error starting workers for ${subdomain}:`, error);

    // Send error response
    if (clusterState.coordinator) {
      await clusterState.coordinator.sendResponse<StartWorkersResponse>(
        CLUSTER_CHANNELS.START_WORKERS_RESPONSE,
        requestId,
        {
          subdomain,
          success: false,
          error: error instanceof Error ? error.message : String(error),
          workersStarted: 0,
        },
      );
    }
  }
}

/**
 * Handle worker status request
 */
async function handleWorkerStatusRequest(
  request: WorkerStatusRequest,
): Promise<void> {
  const { requestId, subdomain } = request;

  try {
    console.log(`[Cluster] Getting worker status (request: ${requestId})`);

    // Collect worker info from this node
    const workers: WorkerInfo[] = [];

    if (subdomain) {
      // Get workers for specific subdomain
      const subdomainWorkers = workerState.activeWorkers.get(subdomain);
      if (subdomainWorkers) {
        for (const [workerKey] of subdomainWorkers.entries()) {
          workers.push({
            subdomain,
            workerKey,
            status: "running",
          });
        }
      }
    } else {
      // Get all workers
      for (const [
        subdomainKey,
        subdomainWorkers,
      ] of workerState.activeWorkers.entries()) {
        for (const [workerKey] of subdomainWorkers.entries()) {
          workers.push({
            subdomain: subdomainKey,
            workerKey,
            status: "running",
          });
        }
      }
    }

    // Get node info
    const nodeInfo = clusterState.nodeRegistry?.getNodeInfo() || {
      nodeId: "unknown",
      hostname: "unknown",
      pid: process.pid,
      startedAt: Date.now(),
      lastHeartbeat: Date.now(),
    };

    // Send response
    if (clusterState.coordinator) {
      await clusterState.coordinator.sendResponse<WorkerStatusResponse>(
        CLUSTER_CHANNELS.WORKER_STATUS_RESPONSE,
        requestId,
        {
          workers,
          nodeInfo,
        },
      );
    }

    console.log(
      `[Cluster] Sent worker status response (workers: ${workers.length})`,
    );
  } catch (error) {
    console.error(`[Cluster] Error getting worker status:`, error);

    // Send error response (empty workers list)
    if (clusterState.coordinator) {
      await clusterState.coordinator.sendResponse<WorkerStatusResponse>(
        CLUSTER_CHANNELS.WORKER_STATUS_RESPONSE,
        requestId,
        {
          workers: [],
          nodeInfo: clusterState.nodeRegistry?.getNodeInfo() || {
            nodeId: "unknown",
            hostname: "unknown",
            pid: process.pid,
            startedAt: Date.now(),
            lastHeartbeat: Date.now(),
          },
        },
      );
    }
  }
}

/**
 * Broadcast stop workers command and wait for acknowledgments
 */
export async function broadcastStopWorkers(
  subdomain: string,
  workerKey?: string,
  timeout?: number,
): Promise<ClusterOperationResult<StopWorkersResponse>> {
  if (!clusterState.coordinator) {
    console.warn(
      "[Cluster] Coordinator not initialized, cannot broadcast stop workers",
    );
    throw new Error("Cluster coordinator not initialized");
  }

  const workerInfo = workerKey ? ` worker: ${workerKey}` : " all workers";
  console.log(
    `[Cluster] Broadcasting stop${workerInfo} command for subdomain: ${subdomain}`,
  );

  const result = await clusterState.coordinator.broadcastAndWait<
    StopWorkersRequest,
    StopWorkersResponse
  >(CLUSTER_CHANNELS.STOP_WORKERS, { subdomain, workerKey }, timeout);

  console.log(
    `[Cluster] Stop${workerInfo} broadcast completed. Success: ${result.success}, ` +
      `Responded: ${result.respondedNodes}/${result.totalNodes}, ` +
      `Duration: ${result.duration}ms`,
  );

  return result;
}

/**
 * Broadcast start workers command and wait for acknowledgments
 */
export async function broadcastStartWorkers(
  subdomain: string,
  workerKey?: string,
  timeout?: number,
): Promise<ClusterOperationResult<StartWorkersResponse>> {
  if (!clusterState.coordinator) {
    console.warn(
      "[Cluster] Coordinator not initialized, cannot broadcast start workers",
    );
    throw new Error("Cluster coordinator not initialized");
  }

  const workerInfo = workerKey ? ` worker: ${workerKey}` : " all workers";
  console.log(
    `[Cluster] Broadcasting start${workerInfo} command for subdomain: ${subdomain}`,
  );

  const result = await clusterState.coordinator.broadcastAndWait<
    StartWorkersRequest,
    StartWorkersResponse
  >(CLUSTER_CHANNELS.START_WORKERS, { subdomain, workerKey }, timeout);

  console.log(
    `[Cluster] Start${workerInfo} broadcast completed. Success: ${result.success}, ` +
      `Responded: ${result.respondedNodes}/${result.totalNodes}, ` +
      `Duration: ${result.duration}ms`,
  );

  return result;
}

/**
 * Get worker status from all nodes in the cluster
 */
export async function getClusterWorkerStatus(
  subdomain?: string,
  timeout?: number,
): Promise<ClusterOperationResult<WorkerStatusResponse>> {
  if (!clusterState.coordinator) {
    console.warn(
      "[Cluster] Coordinator not initialized, cannot get worker status",
    );
    throw new Error("Cluster coordinator not initialized");
  }

  console.log(
    `[Cluster] Requesting worker status${subdomain ? ` for subdomain: ${subdomain}` : " (all subdomains)"}`,
  );

  const result = await clusterState.coordinator.broadcastAndWait<
    WorkerStatusRequest,
    WorkerStatusResponse
  >(CLUSTER_CHANNELS.WORKER_STATUS_REQUEST, { subdomain }, timeout);

  console.log(
    `[Cluster] Worker status request completed. ` +
      `Responded: ${result.respondedNodes}/${result.totalNodes}, ` +
      `Duration: ${result.duration}ms`,
  );

  return result;
}

/**
 * Get all active nodes in the cluster
 */
export async function getActiveNodes() {
  if (!clusterState.nodeRegistry) {
    return [];
  }
  return await clusterState.nodeRegistry.getActiveNodes();
}

/**
 * Get current node information
 */
export function getCurrentNode() {
  if (!clusterState.nodeRegistry) {
    return null;
  }
  return clusterState.nodeRegistry.getNodeInfo();
}

/**
 * Close cluster communication
 * Called during graceful shutdown
 */
export async function closeClusterCommunication() {
  console.log("[Cluster] Closing cluster communication...");

  try {
    // Close subscriber
    if (clusterState.subscriber) {
      await clusterState.subscriber.quit();
      clusterState.subscriber = null;
    }

    // Shutdown coordinator
    if (clusterState.coordinator) {
      await clusterState.coordinator.shutdown();
      clusterState.coordinator = null;
    }

    // Shutdown node registry (unregister from cluster)
    if (clusterState.nodeRegistry) {
      await clusterState.nodeRegistry.shutdown();
      clusterState.nodeRegistry = null;
    }

    clusterState.initialized = false;
    console.log("[Cluster] Cluster communication closed");
  } catch (error) {
    console.error("[Cluster] Error closing cluster communication:", error);
  }
}
