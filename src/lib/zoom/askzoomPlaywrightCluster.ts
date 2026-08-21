/**
 * Cluster-wide AskZoom Playwright coordination via Redis.
 * - Atomic slot leases across Node cluster workers
 * - Global busy count for MAX_SLOTS
 * - Pub/sub control with ACK so cancel/leave confirm on the owning process
 */

import { hostname } from "node:os";
import { randomUUID } from "node:crypto";
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

/** Stable across process restarts when WORKER_ID / NODE_APP_INSTANCE is set (PM2 cluster). */
function buildNodeId(): string {
  const workerKey =
    process.env.WORKER_ID ||
    process.env.NODE_APP_INSTANCE ||
    String(process.pid);
  return `${hostname()}-${workerKey}`;
}

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

function ackChannelKey(subDomain: string) {
  return `askzoom:pw:ack:${subDomain}`;
}

const ACQUIRE_LEASE_LUA = `
local key = KEYS[1]
local busy = KEYS[2]
local nodeId = ARGV[1]
local payload = ARGV[2]
local ttl = tonumber(ARGV[3])
local userId = ARGV[4]
local cur = redis.call('GET', key)
if cur then
  local ok, data = pcall(cjson.decode, cur)
  if ok and data.nodeId and data.nodeId ~= nodeId then
    return {0, cur}
  end
end
redis.call('SET', key, payload, 'EX', ttl)
redis.call('SADD', busy, userId)
return {1, payload}
`;

declare global {
  var __askzoomPwCluster:
    | {
        nodeId: string;
        redis: Redis | null;
        subscriber: Redis | null;
        subscribed: Set<string>;
        handlers: Map<string, AskzoomControlHandler>;
        pendingAcks: Map<
          string,
          {
            resolve: (value: AskzoomControlMessage) => void;
            reject: (error: Error) => void;
            timer: ReturnType<typeof setTimeout>;
          }
        >;
        ready: Promise<void> | null;
        acquireSha: string | null;
      }
    | undefined;
}

function state() {
  if (!global.__askzoomPwCluster) {
    global.__askzoomPwCluster = {
      nodeId: buildNodeId(),
      redis: null,
      subscriber: null,
      subscribed: new Set(),
      handlers: new Map(),
      pendingAcks: new Map(),
      ready: null,
      acquireSha: null,
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

async function ensureAcquireScript(redis: Redis): Promise<string> {
  const s = state();
  if (s.acquireSha) return s.acquireSha;
  s.acquireSha = (await redis.script("LOAD", ACQUIRE_LEASE_LUA)) as string;
  return s.acquireSha;
}

function handlerKey(subDomain: string, userId: string) {
  return `${realm(subDomain)}::${String(userId || "").trim()}`;
}

function settleAck(msg: AskzoomControlMessage) {
  const requestId = String(msg.requestId || "").trim();
  if (!requestId) return;
  const pending = state().pendingAcks.get(requestId);
  if (!pending) return;
  clearTimeout(pending.timer);
  state().pendingAcks.delete(requestId);
  pending.resolve(msg);
}

async function handleControlMessage(channel: string, raw: string) {
  let msg: AskzoomControlMessage;
  try {
    msg = JSON.parse(raw);
  } catch {
    return;
  }
  if (!msg?.subdomain) return;

  if (msg.type === "ack" || channel === ackChannelKey(msg.subdomain)) {
    settleAck(msg);
    return;
  }

  if (!msg.userId) return;
  const key = handlerKey(msg.subdomain, msg.userId);
  const handler = state().handlers.get(key);
  if (!handler) return;

  let ok = true;
  let error = "";
  try {
    await handler(msg);
  } catch (err) {
    ok = false;
    error = err instanceof Error ? err.message : String(err);
  }

  if (msg.requestId) {
    const redis = await getRedis();
    const ack: AskzoomControlMessage = {
      type: "ack",
      userId: msg.userId,
      subdomain: msg.subdomain,
      fromNodeId: state().nodeId,
      requestId: msg.requestId,
      ok,
      error: error || undefined,
      at: new Date().toISOString(),
    };
    await redis.publish(ackChannelKey(msg.subdomain), JSON.stringify(ack));
  }
}

export async function ensureAskzoomControlBus(
  subDomain?: string | null,
): Promise<void> {
  const s = state();
  const sub = realm(subDomain);
  if (!s.ready) {
    s.ready = (async () => {
      const redis = await getRedis();
      await ensureAcquireScript(redis);
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
    await s.subscriber.subscribe(channelKey(sub), ackChannelKey(sub));
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
    Partial<Pick<AskzoomControlMessage, "at" | "requestId">>,
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

/**
 * Publish a control message and wait for the owning node ACK.
 * If this node owns the handler, runs it inline and ACKs locally.
 */
export async function publishAskzoomControlAndWait(
  subDomain: string | null | undefined,
  message: Omit<
    AskzoomControlMessage,
    "subdomain" | "fromNodeId" | "at" | "requestId" | "type"
  > & { type: Exclude<AskzoomControlMessage["type"], "ack" | "refresh"> },
  options: { timeoutMs?: number } = {},
): Promise<AskzoomControlMessage> {
  const sub = realm(subDomain);
  const userId = String(message.userId || "").trim();
  if (!userId) throw new Error("userId is required for control ACK");
  await ensureAskzoomControlBus(sub);

  const requestId = randomUUID();
  const timeoutMs = options.timeoutMs ?? ACK_TIMEOUT_MS;
  const localHandler = state().handlers.get(handlerKey(sub, userId));

  if (localHandler) {
    try {
      await localHandler({
        ...message,
        subdomain: sub,
        fromNodeId: state().nodeId,
        requestId,
        at: new Date().toISOString(),
      });
      return {
        type: "ack",
        userId,
        subdomain: sub,
        fromNodeId: state().nodeId,
        requestId,
        ok: true,
        at: new Date().toISOString(),
      };
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      throw new Error(`Local control handler failed: ${error}`);
    }
  }

  const ackPromise = new Promise<AskzoomControlMessage>((resolve, reject) => {
    const timer = setTimeout(() => {
      state().pendingAcks.delete(requestId);
      reject(
        new Error(
          `Control ACK timeout after ${timeoutMs}ms (${message.type} for ${userId})`,
        ),
      );
    }, timeoutMs);
    state().pendingAcks.set(requestId, { resolve, reject, timer });
  });

  await publishAskzoomControl(sub, { ...message, requestId });
  const ack = await ackPromise;
  if (ack.ok === false) {
    throw new Error(ack.error || `Control ${message.type} failed on owner node`);
  }
  return ack;
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
  const sha = await ensureAcquireScript(redis);
  const nodeId = state().nodeId;
  const lease: AskzoomLease = {
    userId: id,
    nodeId,
    pid: process.pid,
    jobAction: meta.jobAction || "",
    managing: meta.managing === true,
    updatedAt: new Date().toISOString(),
  };
  const result = (await redis.evalsha(
    sha,
    2,
    leaseKey(sub, id),
    busyKey(sub),
    nodeId,
    JSON.stringify(lease),
    String(LEASE_TTL_SEC),
    id,
  )) as [number | string, string];

  const ok = Number(result[0]) === 1;
  if (!ok) {
    let other: AskzoomLease | null = null;
    try {
      other = JSON.parse(result[1]) as AskzoomLease;
    } catch {
      other = null;
    }
    return {
      ok: false,
      lease: other,
      reason: `Slot owned by another node (${other?.nodeId || "unknown"})`,
    };
  }
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
