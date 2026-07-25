/**
 * Type Definitions for Cluster Communication
 */

/**
 * Unique identifier for a cluster node
 * Format: {hostname}-{pid}-{timestamp}
 */
export type NodeId = string;

/**
 * Unique identifier for a cluster request
 */
export type RequestId = string;

/**
 * Node metadata stored in Redis
 */
export interface NodeInfo {
  nodeId: NodeId;
  hostname: string;
  pid: number;
  startedAt: number;
  lastHeartbeat: number;
}

/**
 * Base message structure for cluster communication
 */
export interface ClusterMessage {
  requestId: RequestId;
  sourceNodeId: NodeId;
  timestamp: number;
}

/**
 * Request to stop workers for a subdomain
 * If workerKey is provided, only stops that specific worker
 * Otherwise, stops all workers for the subdomain
 */
export interface StopWorkersRequest extends ClusterMessage {
  subdomain: string;
  workerKey?: string;
  force?: boolean; // If true, forces immediate shutdown without waiting for active jobs
}

/**
 * Response to stop workers request
 */
export interface StopWorkersResponse extends ClusterMessage {
  subdomain: string;
  success: boolean;
  error?: string;
  workersStopped: number;
}

/**
 * Request to start workers for a subdomain
 * If workerKey is provided, only starts that specific worker
 * Otherwise, starts all workers for the subdomain
 */
export interface StartWorkersRequest extends ClusterMessage {
  subdomain: string;
  workerKey?: string;
}

/**
 * Response to start workers request
 */
export interface StartWorkersResponse extends ClusterMessage {
  subdomain: string;
  success: boolean;
  error?: string;
  workersStarted: number;
}

/**
 * Request for worker status
 */
export interface WorkerStatusRequest extends ClusterMessage {
  subdomain?: string; // If undefined, return all subdomains
}

/**
 * Fire-and-forget: clear in-process (L1) form-meta caches on every node.
 * Redis (L2) is already invalidated by the source node.
 */
export interface ClearFormMetaMemoryRequest extends ClusterMessage {
  subdomain: string;
}

/**
 * Worker information
 */
export interface WorkerInfo {
  subdomain: string;
  workerKey: string;
  status: "running" | "stopped" | "error";
  startedAt?: number;
  lastActivity?: number;
  error?: string;
}

/**
 * Response to worker status request
 */
export interface WorkerStatusResponse extends ClusterMessage {
  workers: WorkerInfo[];
  nodeInfo: NodeInfo;
}

/**
 * Aggregated response from cluster operation
 */
export interface ClusterOperationResult<T = any> {
  success: boolean;
  requestId: RequestId;
  totalNodes: number;
  respondedNodes: number;
  timedOutNodes: number;
  responses: Map<NodeId, T>;
  errors: Map<NodeId, string>;
  duration: number;
}

/**
 * Cluster channels for pub/sub
 */
export const CLUSTER_CHANNELS = {
  // Command channels
  STOP_WORKERS: "cluster:stop-workers",
  START_WORKERS: "cluster:start-workers",
  WORKER_STATUS_REQUEST: "cluster:worker-status:request",
  /** Fire-and-forget L1 form-meta memory clear (no response expected) */
  CLEAR_FORM_META_MEMORY: "cluster:clear-form-meta-memory",

  // Response channels (append :requestId)
  STOP_WORKERS_RESPONSE: "cluster:stop-workers:response",
  START_WORKERS_RESPONSE: "cluster:start-workers:response",
  WORKER_STATUS_RESPONSE: "cluster:worker-status:response",

  // Node management
  NODE_HEARTBEAT: "cluster:node:heartbeat",
  NODE_SHUTDOWN: "cluster:node:shutdown",
} as const;

/**
 * Redis key patterns for cluster data
 */
export const CLUSTER_KEYS = {
  NODE_REGISTRY: "cluster:nodes",
  NODE_INFO: (nodeId: NodeId) => `cluster:node:${nodeId}`,
  PENDING_REQUEST: (requestId: RequestId) => `cluster:request:${requestId}`,
} as const;

/**
 * Configuration for cluster operations
 */
export interface ClusterConfig {
  /** Timeout for waiting for responses from all nodes (ms) */
  operationTimeout: number;

  /** Interval for sending heartbeat messages (ms) */
  heartbeatInterval: number;

  /** TTL for node registration in Redis (ms) */
  nodeTTL: number;

  /** TTL for request tracking in Redis (ms) */
  requestTTL: number;

  /** Whether to require all nodes to respond or accept partial success */
  requireAllNodes: boolean;
}

/**
 * Default cluster configuration
 */
export const DEFAULT_CLUSTER_CONFIG: ClusterConfig = {
  operationTimeout: 10000, // 10 seconds
  heartbeatInterval: 30000, // 30 seconds
  nodeTTL: 60000, // 60 seconds (2x heartbeat interval)
  requestTTL: 300000, // 5 minutes
  requireAllNodes: false, // Accept partial success
};
