/**
 * AskZoom Playwright facade over the generic worker cluster.
 * Maps Zoom userId / jobAction / managing / control fields onto WorkerLease + data.
 */

import {
  createWorkerCluster,
  type WorkerControlMessage,
  type WorkerLease,
} from "~/lib/worker/workerCluster";

export type AskzoomLease = {
  userId: string;
  nodeId: string;
  pid: number;
  jobAction: string;
  managing: boolean;
  updatedAt: string;
};

export type AskzoomControlMessage = {
  type: "cancel" | "forceClose" | "leave" | "refresh" | "ack";
  userId: string;
  subdomain: string;
  fromNodeId: string;
  requestId?: string;
  phase?: string;
  message?: string;
  skipRecording?: boolean;
  ok?: boolean;
  error?: string;
  at?: string;
};

export type AskzoomControlHandler = (
  msg: AskzoomControlMessage,
) => void | Promise<void>;

const LEASE_TTL_SEC = Math.max(
  30,
  Number(process.env.ZOOM_PW_LEASE_TTL_SEC || 90),
);

const ACK_TIMEOUT_MS = Math.max(
  1000,
  Number(process.env.ZOOM_PW_CONTROL_ACK_MS || 8000),
);

const cluster = createWorkerCluster({
  namespace: "askzoom-pw",
  leaseTtlSec: LEASE_TTL_SEC,
  ackTimeoutMs: ACK_TIMEOUT_MS,
});

function toAskzoomLease(lease: WorkerLease | null): AskzoomLease | null {
  if (!lease) return null;
  const meta = lease.meta || {};
  return {
    userId: lease.ownerId,
    nodeId: lease.nodeId,
    pid: lease.pid,
    jobAction: String(meta.jobAction || ""),
    managing: meta.managing === true,
    updatedAt: lease.updatedAt,
  };
}

function toAskzoomControl(msg: WorkerControlMessage): AskzoomControlMessage {
  const data = msg.data || {};
  return {
    type: msg.type as AskzoomControlMessage["type"],
    userId: msg.ownerId,
    subdomain: msg.subdomain,
    fromNodeId: msg.fromNodeId,
    requestId: msg.requestId,
    phase: data.phase !== undefined ? String(data.phase) : undefined,
    message: data.message !== undefined ? String(data.message) : undefined,
    skipRecording: data.skipRecording === true,
    ok: msg.ok,
    error: msg.error,
    at: msg.at,
  };
}

function toWorkerControlInput(
  message: Omit<AskzoomControlMessage, "subdomain" | "fromNodeId" | "at"> &
    Partial<Pick<AskzoomControlMessage, "at" | "requestId">>,
): Omit<WorkerControlMessage, "subdomain" | "fromNodeId" | "at"> &
  Partial<Pick<WorkerControlMessage, "at" | "requestId">> {
  const data: Record<string, unknown> = {};
  if (message.phase !== undefined) data.phase = message.phase;
  if (message.message !== undefined) data.message = message.message;
  if (message.skipRecording !== undefined) {
    data.skipRecording = message.skipRecording;
  }
  return {
    type: message.type,
    ownerId: message.userId,
    requestId: message.requestId,
    ok: message.ok,
    error: message.error,
    at: message.at,
    data: Object.keys(data).length ? data : undefined,
  };
}

export function getAskzoomNodeId(): string {
  return cluster.getNodeId();
}

export async function ensureAskzoomControlBus(
  subDomain?: string | null,
): Promise<void> {
  await cluster.ensureBus(subDomain);
}

export function registerAskzoomControlHandler(
  subDomain: string | null | undefined,
  userId: string,
  handler: AskzoomControlHandler,
): void {
  cluster.registerHandler(subDomain, userId, async (msg: WorkerControlMessage) => {
    await handler(toAskzoomControl(msg));
  });
}

export function unregisterAskzoomControlHandler(
  subDomain: string | null | undefined,
  userId: string,
): void {
  cluster.unregisterHandler(subDomain, userId);
}

export async function publishAskzoomControl(
  subDomain: string | null | undefined,
  message: Omit<AskzoomControlMessage, "subdomain" | "fromNodeId" | "at"> &
    Partial<Pick<AskzoomControlMessage, "at" | "requestId">>,
): Promise<void> {
  await cluster.publish(subDomain, toWorkerControlInput(message));
}

export async function publishAskzoomControlAndWait(
  subDomain: string | null | undefined,
  message: Omit<
    AskzoomControlMessage,
    "subdomain" | "fromNodeId" | "at" | "requestId" | "type"
  > & { type: Exclude<AskzoomControlMessage["type"], "ack" | "refresh"> },
  options: { timeoutMs?: number } = {},
): Promise<AskzoomControlMessage> {
  const ack = await cluster.publishAndWait(
    subDomain,
    toWorkerControlInput({ ...message, type: message.type }),
    options,
  );
  return toAskzoomControl(ack);
}

export async function getAskzoomLease(
  subDomain: string | null | undefined,
  userId: string,
): Promise<AskzoomLease | null> {
  return toAskzoomLease(await cluster.getLease(subDomain, userId));
}

export async function acquireAskzoomLease(
  subDomain: string | null | undefined,
  userId: string,
  meta: { jobAction?: string; managing?: boolean } = {},
): Promise<{ ok: boolean; lease: AskzoomLease | null; reason?: string }> {
  const result = await cluster.acquireLease(subDomain, userId, {
    jobAction: meta.jobAction || "",
    managing: meta.managing === true,
  });
  return {
    ok: result.ok,
    lease: toAskzoomLease(result.lease),
    reason: result.reason,
  };
}

export async function refreshAskzoomLease(
  subDomain: string | null | undefined,
  userId: string,
  patch: { jobAction?: string; managing?: boolean } = {},
): Promise<boolean> {
  const metaPatch: Record<string, unknown> = {};
  if (patch.jobAction !== undefined) metaPatch.jobAction = patch.jobAction;
  if (patch.managing !== undefined) metaPatch.managing = patch.managing === true;
  return cluster.refreshLease(subDomain, userId, metaPatch);
}

export async function releaseAskzoomLease(
  subDomain: string | null | undefined,
  userId: string,
): Promise<boolean> {
  return cluster.releaseLease(subDomain, userId);
}

export async function countClusterBusySlots(
  subDomain?: string | null,
): Promise<number> {
  return cluster.countBusy(subDomain);
}

export async function listClusterSlots(subDomain?: string | null) {
  const leases = await cluster.listLeases(subDomain);
  return leases.map(
    (row: {
      ownerId: string;
      busy: boolean;
      meta: Record<string, unknown>;
      nodeId: string;
      pid: number;
      updatedAt: string;
      local: boolean;
    }) => ({
      userId: row.ownerId,
      busy: row.busy,
      managing: row.meta.managing === true,
      jobAction: String(row.meta.jobAction || ""),
      hasBrowser: true,
      nodeId: row.nodeId,
      pid: row.pid,
      updatedAt: row.updatedAt,
      local: row.local,
    }),
  );
}

export function isAskzoomLeaseOwner(
  lease: AskzoomLease | null | undefined,
): boolean {
  if (!lease) return false;
  return cluster.isLeaseOwner({
    ownerId: lease.userId,
    nodeId: lease.nodeId,
    pid: lease.pid,
    updatedAt: lease.updatedAt,
    meta: {
      jobAction: lease.jobAction,
      managing: lease.managing,
    },
  });
}
