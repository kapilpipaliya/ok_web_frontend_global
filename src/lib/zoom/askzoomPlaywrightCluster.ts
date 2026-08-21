/**
 * AskZoom Playwright facade over the generic worker cluster.
 * Maps Zoom userId / jobAction / managing / control fields onto WorkerLease + data.
 */

import {
  createWorkerCluster,
  emitWorkerClusterAlert,
  onWorkerClusterAlert,
  type PublishAndWaitOptions,
  type WorkerClusterMetrics,
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
  token: string;
};

export type AskzoomControlMessage = {
  type: "cancel" | "forceClose" | "leave" | "refresh" | "ack";
  userId: string;
  subdomain: string;
  fromNodeId: string;
  requestId?: string;
  ackPhase?: "accepted" | "done";
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

/** Timeout for leave/cancel/forceClose when waiting for done (longer than accepted ACK). */
export function getAskzoomControlDoneTimeoutMs(): number {
  return Math.max(
    ACK_TIMEOUT_MS,
    Number(process.env.ZOOM_PW_CONTROL_DONE_MS || 45000),
  );
}

const cluster = createWorkerCluster({
  namespace: "askzoom-pw",
  leaseTtlSec: LEASE_TTL_SEC,
  ackTimeoutMs: ACK_TIMEOUT_MS,
});

let zoomWebhookWired = false;
function ensureZoomClusterWebhook(): void {
  if (zoomWebhookWired) return;
  zoomWebhookWired = true;
  onWorkerClusterAlert(async (alert) => {
    if (alert.namespace !== "askzoom-pw") return;
    const url = String(process.env.ZOOM_PW_WEBHOOK_URL || "").trim();
    if (!url) return;
    try {
      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "askzoom-playwright-cluster",
          event: alert.type,
          at: alert.at,
          namespace: alert.namespace,
          detail: alert.detail,
        }),
      });
    } catch (err) {
      console.warn(
        "[askzoomPlaywrightCluster] webhook failed",
        err instanceof Error ? err.message : err,
      );
    }
  });
}
ensureZoomClusterWebhook();

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
    token: lease.token || "",
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
    ackPhase: msg.ackPhase,
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
  options: PublishAndWaitOptions = {},
): Promise<AskzoomControlMessage> {
  const waitFor = options.waitFor || "accepted";
  const timeoutMs =
    options.timeoutMs ??
    (waitFor === "done" ? getAskzoomControlDoneTimeoutMs() : undefined);
  const ack = await cluster.publishAndWait(
    subDomain,
    toWorkerControlInput({ ...message, type: message.type }),
    { ...options, waitFor, timeoutMs },
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

export async function reclaimAskzoomLease(
  subDomain: string | null | undefined,
  userId: string,
  meta: { jobAction?: string; managing?: boolean } = {},
  options?: { forceCloseTimeoutMs?: number; maxStealPttlMs?: number },
): Promise<{ ok: boolean; lease: AskzoomLease | null; reason?: string }> {
  const result = await cluster.reclaimLease(
    subDomain,
    userId,
    {
      jobAction: meta.jobAction || "",
      managing: meta.managing === true,
    },
    options,
  );
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
  options: { token?: string } = {},
): Promise<boolean> {
  const metaPatch: Record<string, unknown> = {};
  if (patch.jobAction !== undefined) metaPatch.jobAction = patch.jobAction;
  if (patch.managing !== undefined) metaPatch.managing = patch.managing === true;
  let token = options.token;
  if (!token) {
    const lease = await cluster.getLease(subDomain, userId);
    token = lease?.token || undefined;
  }
  return cluster.refreshLease(
    subDomain,
    userId,
    metaPatch,
    token ? { token } : {},
  );
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
    token: lease.token || "",
    meta: {
      jobAction: lease.jobAction,
      managing: lease.managing,
    },
  });
}

export function getAskzoomClusterMetrics(): WorkerClusterMetrics {
  return cluster.getMetrics();
}

export function emitAskzoomLeaseRefreshLost(detail: {
  userId: string;
  subdomain?: string;
  reason?: string;
}): void {
  emitWorkerClusterAlert({
    type: "leaseRefreshLost",
    namespace: "askzoom-pw",
    detail: {
      ownerId: detail.userId,
      subdomain: detail.subdomain || "",
      reason: detail.reason || "lease refresh failed / ownership lost",
    },
  });
}

export async function shutdownAskzoomPlaywrightCluster(): Promise<void> {
  await cluster.shutdown();
}
