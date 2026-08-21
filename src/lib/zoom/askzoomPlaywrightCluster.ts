/**
 * Cluster-wide AskZoom Playwright coordination via Redis.
 * - Slot leases (who owns a user's browser) across Node cluster workers
 * - Global busy count for MAX_SLOTS
 * - Pub/sub control so cancel/leave reach the owning process
 */

import { hostname } from "node:os";
import Redis from "ioredis";

export type AskzoomLease = {
  userId: string;
  nodeId: string;
  pid: number;
  jobAction: string;
  managing: boolean;
  updatedAt: string;
};

export type AskzoomControlMessage = {
  type: "cancel" | "forceClose" | "leave" | "refresh";
  userId: string;
  subdomain: string;
  fromNodeId: string;
  phase?: string;
  message?: string;
  skipRecording?: boolean;
  at?: string;
};

export type AskzoomControlHandler = (
  msg: AskzoomControlMessage,
) => void | Promise<void>;

const LEASE_TTL_SEC = Math.max(
  30,
  Number(process.env.ZOOM_PW_LEASE_TTL_SEC || 90),
);

function redisOptions() {
  return {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379", 10),
    password: process.env.REDIS_PASSWORD || undefined,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  };
}

function realm(subDomain?: string | null) {
  return String(subDomain || "default").trim() || "default";
}

function leaseKey(subDomain: string, userId: string) {
  return `askzoom:pw:lease:${subDomain}:${userId}`;
}

function busyKey(subDomain: string) {
  return `askzoom:pw:busy:${subDomain}`;
}

function channelKey(subDomain: string) {
  return `askzoom:pw:ctrl:${subDomain}`;
}

declare global {
  // Process-wide Redis bus (one subscriber). Same pattern as clusterState in clusterCommunication.
  var __askzoomPwCluster:
    | {
        nodeId: string;
        redis: Redis | null;
        subscriber: Redis | null;
        subscribed: Set<string>;
        handlers: Map<string, AskzoomControlHandler>;
        ready: Promise<void> | null;
      }
    | undefined;
}

function state() {
  if (!global.__askzoomPwCluster) {
    global.__askzoomPwCluster = {
      nodeId: `${hostname()}-${process.pid}`,
      redis: null,
      subscriber: null,
      subscribed: new Set(),
      handlers: new Map(),
      ready: null,
    };
  }
  return global.__askzoomPwCluster;
}

export function getAskzoomNodeId(): string {
  return state().nodeId;
}

async function getRedis(): Promise<Redis> {
  const s = state();
  if (s.redis) return s.redis;
  const client = new Redis(redisOptions());
  client.on("error", (err) => {
    console.warn("[askzoomPlaywrightCluster] redis error", err.message);
  });
  s.redis = client;
  return client;
}

function handlerKey(subDomain: string, userId: string) {
  return `${realm(subDomain)}::${String(userId || "").trim()}`;
}

async function handleControlMessage(channel: string, raw: string) {
  let msg: AskzoomControlMessage;
  try {
    msg = JSON.parse(raw);
  } catch {
    return;
  }
  if (!msg?.userId || !msg?.subdomain) return;
  const key = handlerKey(msg.subdomain, msg.userId);
  const handler = state().handlers.get(key);
  if (!handler) return;
  await handler(msg);
}

export async function ensureAskzoomControlBus(
  subDomain?: string | null,
): Promise<void> {
  const s = state();
  const sub = realm(subDomain);
  if (!s.ready) {
    s.ready = (async () => {
      await getRedis();
      if (!s.subscriber) {
        const subClient = new Redis(redisOptions());
        subClient.on("error", (err) => {
          console.warn(
            "[askzoomPlaywrightCluster] subscriber error",
            err.message,
          );
        });
        subClient.on("message", (channel, message) => {
          void handleControlMessage(channel, message);
        });
        s.subscriber = subClient;
      }
    })();
  }
  await s.ready;
  if (!s.subscribed.has(sub) && s.subscriber) {
    await s.subscriber.subscribe(channelKey(sub));
    s.subscribed.add(sub);
  }
}

export function registerAskzoomControlHandler(
  subDomain: string | null | undefined,
  userId: string,
  handler: AskzoomControlHandler,
): void {
  const id = String(userId || "").trim();
  if (!id) return;
  state().handlers.set(handlerKey(subDomain, id), handler);
}

export function unregisterAskzoomControlHandler(
  subDomain: string | null | undefined,
  userId: string,
): void {
  const id = String(userId || "").trim();
  if (!id) return;
  state().handlers.delete(handlerKey(subDomain, id));
}

export async function publishAskzoomControl(
  subDomain: string | null | undefined,
  message: Omit<AskzoomControlMessage, "subdomain" | "fromNodeId" | "at"> &
    Partial<Pick<AskzoomControlMessage, "at">>,
): Promise<void> {
  const sub = realm(subDomain);
  await ensureAskzoomControlBus(sub);
  const redis = await getRedis();
  const payload: AskzoomControlMessage = {
    ...message,
    subdomain: sub,
    fromNodeId: state().nodeId,
    at: message.at || new Date().toISOString(),
  };
  await redis.publish(channelKey(sub), JSON.stringify(payload));
}

export async function getAskzoomLease(
  subDomain: string | null | undefined,
  userId: string,
): Promise<AskzoomLease | null> {
  const id = String(userId || "").trim();
  if (!id) return null;
  const redis = await getRedis();
  const raw = await redis.get(leaseKey(realm(subDomain), id));
  if (!raw) return null;
  return JSON.parse(raw) as AskzoomLease;
}

export async function acquireAskzoomLease(
  subDomain: string | null | undefined,
  userId: string,
  meta: { jobAction?: string; managing?: boolean } = {},
): Promise<{ ok: boolean; lease: AskzoomLease | null; reason?: string }> {
  const id = String(userId || "").trim();
  if (!id) return { ok: false, lease: null, reason: "userId required" };
  const sub = realm(subDomain);
  await ensureAskzoomControlBus(sub);
  const redis = await getRedis();
  const nodeId = state().nodeId;
  const lease: AskzoomLease = {
    userId: id,
    nodeId,
    pid: process.pid,
    jobAction: meta.jobAction || "",
    managing: meta.managing === true,
    updatedAt: new Date().toISOString(),
  };
  const key = leaseKey(sub, id);
  const busy = busyKey(sub);
  const existing = await redis.get(key);
  if (existing) {
    try {
      const cur = JSON.parse(existing) as AskzoomLease;
      if (cur.nodeId && cur.nodeId !== nodeId) {
        return {
          ok: false,
          lease: cur,
          reason: `Slot owned by another node (${cur.nodeId})`,
        };
      }
    } catch {
      // replace corrupt lease
    }
  }
  const tx = redis.multi();
  tx.set(key, JSON.stringify(lease), "EX", LEASE_TTL_SEC);
  tx.sadd(busy, id);
  await tx.exec();
  return { ok: true, lease };
}

export async function refreshAskzoomLease(
  subDomain: string | null | undefined,
  userId: string,
  patch: { jobAction?: string; managing?: boolean } = {},
): Promise<boolean> {
  const id = String(userId || "").trim();
  if (!id) return false;
  const sub = realm(subDomain);
  const redis = await getRedis();
  const key = leaseKey(sub, id);
  const raw = await redis.get(key);
  if (!raw) return false;
  const cur = JSON.parse(raw) as AskzoomLease;
  if (cur.nodeId !== state().nodeId) return false;
  const next: AskzoomLease = {
    ...cur,
    jobAction:
      patch.jobAction !== undefined ? patch.jobAction : cur.jobAction,
    managing:
      patch.managing !== undefined ? patch.managing === true : cur.managing,
    updatedAt: new Date().toISOString(),
    pid: process.pid,
    nodeId: state().nodeId,
  };
  await redis
    .multi()
    .set(key, JSON.stringify(next), "EX", LEASE_TTL_SEC)
    .sadd(busyKey(sub), id)
    .exec();
  return true;
}

export async function releaseAskzoomLease(
  subDomain: string | null | undefined,
  userId: string,
): Promise<boolean> {
  const id = String(userId || "").trim();
  if (!id) return false;
  const sub = realm(subDomain);
  const redis = await getRedis();
  const key = leaseKey(sub, id);
  const raw = await redis.get(key);
  if (raw) {
    const cur = JSON.parse(raw) as AskzoomLease;
    if (cur.nodeId && cur.nodeId !== state().nodeId) {
      return false;
    }
  }
  await redis.multi().del(key).srem(busyKey(sub), id).exec();
  return true;
}

export async function countClusterBusySlots(
  subDomain?: string | null,
): Promise<number> {
  const redis = await getRedis();
  const sub = realm(subDomain);
  const members = await redis.smembers(busyKey(sub));
  if (!members.length) return 0;
  const pipe = redis.pipeline();
  for (const userId of members) pipe.exists(leaseKey(sub, userId));
  const results = await pipe.exec();
  let alive = 0;
  const stale: string[] = [];
  members.forEach((userId, index) => {
    const exists = Number(results?.[index]?.[1] || 0) === 1;
    if (exists) alive += 1;
    else stale.push(userId);
  });
  if (stale.length) {
    await redis.srem(busyKey(sub), ...stale);
  }
  return alive;
}

export async function listClusterSlots(subDomain?: string | null) {
  const redis = await getRedis();
  const sub = realm(subDomain);
  const members = await redis.smembers(busyKey(sub));
  const slots = [];
  for (const userId of members) {
    const lease = await getAskzoomLease(sub, userId);
    if (!lease) continue;
    slots.push({
      userId,
      busy: true,
      managing: !!lease.managing,
      jobAction: lease.jobAction || "",
      hasBrowser: true,
      nodeId: lease.nodeId,
      pid: lease.pid,
      updatedAt: lease.updatedAt,
      local: lease.nodeId === state().nodeId,
    });
  }
  return slots;
}

export function isAskzoomLeaseOwner(
  lease: AskzoomLease | null | undefined,
): boolean {
  return !!lease && lease.nodeId === state().nodeId;
}
