/**
 * Generic cluster coordination for background workers via Redis.
 * - Atomic owner leases across Node cluster processes
 * - Busy-set for global concurrency caps
 * - Pub/sub control with ACK so cancel/leave confirm on the owning process
 *
 * Use createWorkerCluster({ namespace }) per worker family (e.g. 'askzoom-pw').
 */

import { hostname } from "node:os";
import { randomUUID } from "node:crypto";
import Redis from "ioredis";

export type WorkerLease = {
  ownerId: string;
  nodeId: string;
  pid: number;
  updatedAt: string;
  meta: Record<string, unknown>;
};

export type WorkerControlMessage = {
  type: string;
  ownerId: string;
  subdomain: string;
  fromNodeId: string;
  requestId?: string;
  ok?: boolean;
  error?: string;
  at?: string;
  data?: Record<string, unknown>;
};

export type WorkerControlHandler = (
  msg: WorkerControlMessage,
) => void | Promise<void>;

export type WorkerClusterOptions = {
  namespace: string;
  leaseTtlSec?: number;
  ackTimeoutMs?: number;
};

export type WorkerCluster = {
  namespace: string;
  getNodeId: () => string;
  ensureBus: (subDomain?: string | null) => Promise<void>;
  acquireLease: (
    subDomain: string | null | undefined,
    ownerId: string,
    meta?: Record<string, unknown>,
  ) => Promise<{ ok: boolean; lease: WorkerLease | null; reason?: string }>;
  refreshLease: (
    subDomain: string | null | undefined,
    ownerId: string,
    metaPatch?: Record<string, unknown>,
  ) => Promise<boolean>;
  releaseLease: (
    subDomain: string | null | undefined,
    ownerId: string,
  ) => Promise<boolean>;
  getLease: (
    subDomain: string | null | undefined,
    ownerId: string,
  ) => Promise<WorkerLease | null>;
  isLeaseOwner: (lease: WorkerLease | null | undefined) => boolean;
  countBusy: (subDomain?: string | null) => Promise<number>;
  listLeases: (subDomain?: string | null) => Promise<
    Array<{
      ownerId: string;
      busy: boolean;
      meta: Record<string, unknown>;
      nodeId: string;
      pid: number;
      updatedAt: string;
      local: boolean;
    }>
  >;
  registerHandler: (
    subDomain: string | null | undefined,
    ownerId: string,
    handler: WorkerControlHandler,
  ) => void;
  unregisterHandler: (
    subDomain: string | null | undefined,
    ownerId: string,
  ) => void;
  publish: (
    subDomain: string | null | undefined,
    message: Omit<
      WorkerControlMessage,
      "subdomain" | "fromNodeId" | "at"
    > &
      Partial<Pick<WorkerControlMessage, "at" | "requestId">>,
  ) => Promise<void>;
  publishAndWait: (
    subDomain: string | null | undefined,
    message: Omit<
      WorkerControlMessage,
      "subdomain" | "fromNodeId" | "at" | "requestId" | "type" | "ok" | "error"
    > & { type: string },
    options?: { timeoutMs?: number },
  ) => Promise<WorkerControlMessage>;
};

const DEFAULT_LEASE_TTL_SEC = Math.max(
  30,
  Number(process.env.WORKER_CLUSTER_LEASE_TTL_SEC || 90),
);

const DEFAULT_ACK_TIMEOUT_MS = Math.max(
  1000,
  Number(process.env.WORKER_CLUSTER_CONTROL_ACK_MS || 8000),
);

const ACQUIRE_LEASE_LUA = `
local key = KEYS[1]
local busy = KEYS[2]
local nodeId = ARGV[1]
local payload = ARGV[2]
local ttl = tonumber(ARGV[3])
local ownerId = ARGV[4]
local cur = redis.call('GET', key)
if cur then
  local ok, data = pcall(cjson.decode, cur)
  if ok and data.nodeId and data.nodeId ~= nodeId then
    return {0, cur}
  end
end
redis.call('SET', key, payload, 'EX', ttl)
redis.call('SADD', busy, ownerId)
return {1, payload}
`;

/** Stable across process restarts when WORKER_ID / NODE_APP_INSTANCE is set. */
export function buildWorkerNodeId(): string {
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

function normalizeNamespace(namespace: string): string {
  const ns = String(namespace || "")
    .trim()
    .replace(/[^a-zA-Z0-9._-]+/g, "-");
  if (!ns) throw new Error("workerCluster namespace is required");
  return ns;
}

type BusState = {
  nodeId: string;
  redis: Redis | null;
  subscriber: Redis | null;
  /** `${namespace}::${subDomain}` */
  subscribed: Set<string>;
  /** `${namespace}::${subDomain}::${ownerId}` */
  handlers: Map<string, WorkerControlHandler>;
  pendingAcks: Map<
    string,
    {
      resolve: (value: WorkerControlMessage) => void;
      reject: (error: Error) => void;
      timer: ReturnType<typeof setTimeout>;
    }
  >;
  ready: Promise<void> | null;
  acquireSha: string | null;
  /** Cached cluster instances by namespace */
  clusters: Map<string, WorkerCluster>;
};

declare global {
  var __workerClusterBus: BusState | undefined;
}

function bus(): BusState {
  if (!global.__workerClusterBus) {
    global.__workerClusterBus = {
      nodeId: buildWorkerNodeId(),
      redis: null,
      subscriber: null,
      subscribed: new Set(),
      handlers: new Map(),
      pendingAcks: new Map(),
      ready: null,
      acquireSha: null,
      clusters: new Map(),
    };
  }
  return global.__workerClusterBus;
}

function leaseKey(namespace: string, subDomain: string, ownerId: string) {
  return `worker:${namespace}:lease:${subDomain}:${ownerId}`;
}

function busyKey(namespace: string, subDomain: string) {
  return `worker:${namespace}:busy:${subDomain}`;
}

function channelKey(namespace: string, subDomain: string) {
  return `worker:${namespace}:ctrl:${subDomain}`;
}

function ackChannelKey(namespace: string, subDomain: string) {
  return `worker:${namespace}:ack:${subDomain}`;
}

function handlerKey(
  namespace: string,
  subDomain: string | null | undefined,
  ownerId: string,
) {
  return `${namespace}::${realm(subDomain)}::${String(ownerId || "").trim()}`;
}

function subscribeKey(namespace: string, subDomain: string) {
  return `${namespace}::${subDomain}`;
}

/** Parse `worker:{ns}:ctrl|ack:{sub}` → { namespace, kind, subdomain } */
function parseChannel(channel: string): {
  namespace: string;
  kind: "ctrl" | "ack";
  subdomain: string;
} | null {
  const m = /^worker:([^:]+):(ctrl|ack):(.+)$/.exec(channel);
  if (!m) return null;
  return {
    namespace: m[1],
    kind: m[2] as "ctrl" | "ack",
    subdomain: m[3],
  };
}

async function getRedis(): Promise<Redis> {
  const s = bus();
  if (s.redis) return s.redis;
  const client = new Redis(redisOptions());
  client.on("error", (err) => {
    console.warn("[workerCluster] redis error", err.message);
  });
  s.redis = client;
  return client;
}

async function ensureAcquireScript(redis: Redis): Promise<string> {
  const s = bus();
  if (s.acquireSha) return s.acquireSha;
  s.acquireSha = (await redis.script("LOAD", ACQUIRE_LEASE_LUA)) as string;
  return s.acquireSha;
}

function settleAck(msg: WorkerControlMessage) {
  const requestId = String(msg.requestId || "").trim();
  if (!requestId) return;
  const pending = bus().pendingAcks.get(requestId);
  if (!pending) return;
  clearTimeout(pending.timer);
  bus().pendingAcks.delete(requestId);
  pending.resolve(msg);
}

async function handleControlMessage(channel: string, raw: string) {
  let msg: WorkerControlMessage;
  try {
    msg = JSON.parse(raw);
  } catch {
    return;
  }

  const parsed = parseChannel(channel);
  if (!parsed) return;

  if (msg.type === "ack" || parsed.kind === "ack") {
    settleAck(msg);
    return;
  }

  if (!msg.ownerId || !msg.subdomain) return;
  const key = handlerKey(parsed.namespace, msg.subdomain, msg.ownerId);
  const handler = bus().handlers.get(key);
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
    const ack: WorkerControlMessage = {
      type: "ack",
      ownerId: msg.ownerId,
      subdomain: msg.subdomain,
      fromNodeId: bus().nodeId,
      requestId: msg.requestId,
      ok,
      error: error || undefined,
      at: new Date().toISOString(),
    };
    await redis.publish(
      ackChannelKey(parsed.namespace, msg.subdomain),
      JSON.stringify(ack),
    );
  }
}

async function ensureRedisBus(): Promise<void> {
  const s = bus();
  if (!s.ready) {
    s.ready = (async () => {
      const redis = await getRedis();
      await ensureAcquireScript(redis);
      if (!s.subscriber) {
        const subClient = new Redis(redisOptions());
        subClient.on("error", (err) => {
          console.warn("[workerCluster] subscriber error", err.message);
        });
        subClient.on("message", (channel, message) => {
          void handleControlMessage(channel, message);
        });
        s.subscriber = subClient;
      }
    })();
  }
  await s.ready;
}

function createClusterInstance(options: WorkerClusterOptions): WorkerCluster {
  const namespace = normalizeNamespace(options.namespace);
  const leaseTtlSec = Math.max(
    30,
    Number(options.leaseTtlSec ?? DEFAULT_LEASE_TTL_SEC),
  );
  const ackTimeoutMs = Math.max(
    1000,
    Number(options.ackTimeoutMs ?? DEFAULT_ACK_TIMEOUT_MS),
  );

  const ensureBus = async (subDomain?: string | null): Promise<void> => {
    const sub = realm(subDomain);
    await ensureRedisBus();
    const s = bus();
    const sk = subscribeKey(namespace, sub);
    if (!s.subscribed.has(sk) && s.subscriber) {
      await s.subscriber.subscribe(
        channelKey(namespace, sub),
        ackChannelKey(namespace, sub),
      );
      s.subscribed.add(sk);
    }
  };

  const getLease = async (
    subDomain: string | null | undefined,
    ownerId: string,
  ): Promise<WorkerLease | null> => {
    const id = String(ownerId || "").trim();
    if (!id) return null;
    const redis = await getRedis();
    const raw = await redis.get(leaseKey(namespace, realm(subDomain), id));
    if (!raw) return null;
    return JSON.parse(raw) as WorkerLease;
  };

  const publish = async (
    subDomain: string | null | undefined,
    message: Omit<
      WorkerControlMessage,
      "subdomain" | "fromNodeId" | "at"
    > &
      Partial<Pick<WorkerControlMessage, "at" | "requestId">>,
  ): Promise<void> => {
    const sub = realm(subDomain);
    await ensureBus(sub);
    const redis = await getRedis();
    const payload: WorkerControlMessage = {
      ...message,
      subdomain: sub,
      fromNodeId: bus().nodeId,
      at: message.at || new Date().toISOString(),
    };
    await redis.publish(channelKey(namespace, sub), JSON.stringify(payload));
  };

  const cluster: WorkerCluster = {
    namespace,
    getNodeId: () => bus().nodeId,
    ensureBus,

    async acquireLease(subDomain, ownerId, meta = {}) {
      const id = String(ownerId || "").trim();
      if (!id) return { ok: false, lease: null, reason: "ownerId required" };
      const sub = realm(subDomain);
      await ensureBus(sub);
      const redis = await getRedis();
      const sha = await ensureAcquireScript(redis);
      const nodeId = bus().nodeId;
      const lease: WorkerLease = {
        ownerId: id,
        nodeId,
        pid: process.pid,
        updatedAt: new Date().toISOString(),
        meta: { ...meta },
      };
      const result = (await redis.evalsha(
        sha,
        2,
        leaseKey(namespace, sub, id),
        busyKey(namespace, sub),
        nodeId,
        JSON.stringify(lease),
        String(leaseTtlSec),
        id,
      )) as [number | string, string];

      const ok = Number(result[0]) === 1;
      if (!ok) {
        let other: WorkerLease | null = null;
        try {
          other = JSON.parse(result[1]) as WorkerLease;
        } catch {
          other = null;
        }
        return {
          ok: false,
          lease: other,
          reason: `Lease owned by another node (${other?.nodeId || "unknown"})`,
        };
      }
      return { ok: true, lease };
    },

    async refreshLease(subDomain, ownerId, metaPatch = {}) {
      const id = String(ownerId || "").trim();
      if (!id) return false;
      const sub = realm(subDomain);
      const redis = await getRedis();
      const key = leaseKey(namespace, sub, id);
      const raw = await redis.get(key);
      if (!raw) return false;
      const cur = JSON.parse(raw) as WorkerLease;
      if (cur.nodeId !== bus().nodeId) return false;
      const next: WorkerLease = {
        ...cur,
        meta: { ...(cur.meta || {}), ...metaPatch },
        updatedAt: new Date().toISOString(),
        pid: process.pid,
        nodeId: bus().nodeId,
      };
      await redis
        .multi()
        .set(key, JSON.stringify(next), "EX", leaseTtlSec)
        .sadd(busyKey(namespace, sub), id)
        .exec();
      return true;
    },

    async releaseLease(subDomain, ownerId) {
      const id = String(ownerId || "").trim();
      if (!id) return false;
      const sub = realm(subDomain);
      const redis = await getRedis();
      const key = leaseKey(namespace, sub, id);
      const raw = await redis.get(key);
      if (raw) {
        const cur = JSON.parse(raw) as WorkerLease;
        if (cur.nodeId && cur.nodeId !== bus().nodeId) {
          return false;
        }
      }
      await redis.multi().del(key).srem(busyKey(namespace, sub), id).exec();
      return true;
    },

    getLease,

    isLeaseOwner(lease) {
      return !!lease && lease.nodeId === bus().nodeId;
    },

    async countBusy(subDomain) {
      const redis = await getRedis();
      const sub = realm(subDomain);
      const members = await redis.smembers(busyKey(namespace, sub));
      if (!members.length) return 0;
      const pipe = redis.pipeline();
      for (const ownerId of members) {
        pipe.exists(leaseKey(namespace, sub, ownerId));
      }
      const results = await pipe.exec();
      let alive = 0;
      const stale: string[] = [];
      members.forEach((ownerId, index) => {
        const exists = Number(results?.[index]?.[1] || 0) === 1;
        if (exists) alive += 1;
        else stale.push(ownerId);
      });
      if (stale.length) {
        await redis.srem(busyKey(namespace, sub), ...stale);
      }
      return alive;
    },

    async listLeases(subDomain) {
      const redis = await getRedis();
      const sub = realm(subDomain);
      const members = await redis.smembers(busyKey(namespace, sub));
      const leases = [];
      for (const ownerId of members) {
        const lease = await getLease(sub, ownerId);
        if (!lease) continue;
        leases.push({
          ownerId,
          busy: true,
          meta: lease.meta || {},
          nodeId: lease.nodeId,
          pid: lease.pid,
          updatedAt: lease.updatedAt,
          local: lease.nodeId === bus().nodeId,
        });
      }
      return leases;
    },

    registerHandler(subDomain, ownerId, handler) {
      const id = String(ownerId || "").trim();
      if (!id) return;
      bus().handlers.set(handlerKey(namespace, subDomain, id), handler);
    },

    unregisterHandler(subDomain, ownerId) {
      const id = String(ownerId || "").trim();
      if (!id) return;
      bus().handlers.delete(handlerKey(namespace, subDomain, id));
    },

    publish,

    async publishAndWait(subDomain, message, options = {}) {
      const sub = realm(subDomain);
      const ownerId = String(message.ownerId || "").trim();
      if (!ownerId) throw new Error("ownerId is required for control ACK");
      await ensureBus(sub);

      const requestId = randomUUID();
      const timeoutMs = options.timeoutMs ?? ackTimeoutMs;
      const localHandler = bus().handlers.get(
        handlerKey(namespace, sub, ownerId),
      );

      if (localHandler) {
        try {
          await localHandler({
            ...message,
            subdomain: sub,
            fromNodeId: bus().nodeId,
            requestId,
            at: new Date().toISOString(),
          });
          return {
            type: "ack",
            ownerId,
            subdomain: sub,
            fromNodeId: bus().nodeId,
            requestId,
            ok: true,
            at: new Date().toISOString(),
          };
        } catch (err) {
          const error = err instanceof Error ? err.message : String(err);
          throw new Error(`Local control handler failed: ${error}`);
        }
      }

      const ackPromise = new Promise<WorkerControlMessage>((resolve, reject) => {
        const timer = setTimeout(() => {
          bus().pendingAcks.delete(requestId);
          reject(
            new Error(
              `Control ACK timeout after ${timeoutMs}ms (${message.type} for ${ownerId})`,
            ),
          );
        }, timeoutMs);
        bus().pendingAcks.set(requestId, { resolve, reject, timer });
      });

      await publish(sub, { ...message, requestId });
      const ack = await ackPromise;
      if (ack.ok === false) {
        throw new Error(
          ack.error || `Control ${message.type} failed on owner node`,
        );
      }
      return ack;
    },
  };

  return cluster;
}

/**
 * Create or reuse a namespaced worker cluster coordinator.
 * Same namespace returns the same instance (shared handlers/leases).
 */
export function createWorkerCluster(
  options: WorkerClusterOptions,
): WorkerCluster {
  const namespace = normalizeNamespace(options.namespace);
  const s = bus();
  const existing = s.clusters.get(namespace);
  if (existing) return existing;
  const cluster = createClusterInstance({ ...options, namespace });
  s.clusters.set(namespace, cluster);
  return cluster;
}

export function getWorkerNodeId(): string {
  return bus().nodeId;
}
