/**
 * Generic cluster coordination for background workers via Redis.
 * - Atomic owner leases across Node cluster processes
 * - Busy-set for global concurrency caps
 * - Two-phase pub/sub control ACK (accepted → done)
 * - Stale-owner reclaim, metrics, graceful shutdown
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
  /** Fencing token; changes on every acquire/reclaim. */
  token: string;
  meta: Record<string, unknown>;
};

export type WorkerAckPhase = "accepted" | "done";

export type WorkerControlMessage = {
  type: string;
  ownerId: string;
  subdomain: string;
  fromNodeId: string;
  requestId?: string;
  /** Two-phase ACK: accepted = work started; done = work finished. */
  ackPhase?: WorkerAckPhase;
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

export type WorkerClusterMetrics = {
  acquireOk: number;
  acquireFail: number;
  reclaimOk: number;
  reclaimFail: number;
  publishAndWaitOk: number;
  publishAndWaitTimeout: number;
  publishAndWaitFail: number;
  controlLatencyMsSum: number;
  controlLatencyMsCount: number;
  busySlotsLast: number;
  shutdownReleases: number;
};

export type PublishAndWaitOptions = {
  timeoutMs?: number;
  /** Default `accepted` — return once owner starts work. Use `done` to wait for completion. */
  waitFor?: WorkerAckPhase;
};

export type WorkerCluster = {
  namespace: string;
  leaseTtlSec: number;
  ackTimeoutMs: number;
  getNodeId: () => string;
  ensureBus: (subDomain?: string | null) => Promise<void>;
  acquireLease: (
    subDomain: string | null | undefined,
    ownerId: string,
    meta?: Record<string, unknown>,
  ) => Promise<{ ok: boolean; lease: WorkerLease | null; reason?: string }>;
  /**
   * Best-effort forceClose to prior owner, then steal the lease.
   * Use when the prior worker may be dead but the key has not expired yet.
   */
  reclaimLease: (
    subDomain: string | null | undefined,
    ownerId: string,
    meta?: Record<string, unknown>,
    options?: { forceCloseTimeoutMs?: number },
  ) => Promise<{ ok: boolean; lease: WorkerLease | null; reason?: string }>;
  refreshLease: (
    subDomain: string | null | undefined,
    ownerId: string,
    metaPatch?: Record<string, unknown>,
    options?: { token?: string },
  ) => Promise<boolean>;
  releaseLease: (
    subDomain: string | null | undefined,
    ownerId: string,
    options?: { token?: string; force?: boolean },
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
      token: string;
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
      | "subdomain"
      | "fromNodeId"
      | "at"
      | "requestId"
      | "type"
      | "ok"
      | "error"
      | "ackPhase"
    > & { type: string },
    options?: PublishAndWaitOptions,
  ) => Promise<WorkerControlMessage>;
  getMetrics: () => WorkerClusterMetrics;
  resetMetrics: () => void;
  /** Release local leases and invoke forceClose handlers. */
  shutdown: () => Promise<void>;
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
local steal = tonumber(ARGV[5]) or 0
local cur = redis.call('GET', key)
if cur then
  local ok, data = pcall(cjson.decode, cur)
  if ok and data.nodeId and data.nodeId ~= nodeId then
    if steal ~= 1 then
      return {0, cur}
    end
  end
end
redis.call('SET', key, payload, 'EX', ttl)
redis.call('SADD', busy, ownerId)
return {1, payload}
`;

const REFRESH_LEASE_LUA = `
local key = KEYS[1]
local busy = KEYS[2]
local nodeId = ARGV[1]
local payload = ARGV[2]
local ttl = tonumber(ARGV[3])
local ownerId = ARGV[4]
local expectToken = ARGV[5]
local cur = redis.call('GET', key)
if not cur then return {0, ''} end
local ok, data = pcall(cjson.decode, cur)
if not ok or not data.nodeId or data.nodeId ~= nodeId then
  return {0, cur or ''}
end
if expectToken ~= '' and data.token and data.token ~= expectToken then
  return {0, cur}
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

function emptyMetrics(): WorkerClusterMetrics {
  return {
    acquireOk: 0,
    acquireFail: 0,
    reclaimOk: 0,
    reclaimFail: 0,
    publishAndWaitOk: 0,
    publishAndWaitTimeout: 0,
    publishAndWaitFail: 0,
    controlLatencyMsSum: 0,
    controlLatencyMsCount: 0,
    busySlotsLast: 0,
    shutdownReleases: 0,
  };
}

type PendingAck = {
  waitFor: WorkerAckPhase;
  resolve: (value: WorkerControlMessage) => void;
  reject: (error: Error) => void;
  timer: ReturnType<typeof setTimeout>;
  startedAt: number;
};

type FrozenOptions = {
  leaseTtlSec: number;
  ackTimeoutMs: number;
};

type LocalLeaseRef = {
  namespace: string;
  subDomain: string;
  ownerId: string;
  token: string;
};

type BusState = {
  nodeId: string;
  redis: Redis | null;
  subscriber: Redis | null;
  subscribed: Set<string>;
  handlers: Map<string, WorkerControlHandler>;
  pendingAcks: Map<string, PendingAck>;
  ready: Promise<void> | null;
  acquireSha: string | null;
  refreshSha: string | null;
  clusters: Map<
    string,
    { cluster: WorkerCluster; options: FrozenOptions; metrics: WorkerClusterMetrics }
  >;
  /** Leases acquired by this process (for shutdown). */
  localLeases: Map<string, LocalLeaseRef>;
  shuttingDown: boolean;
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
      refreshSha: null,
      clusters: new Map(),
      localLeases: new Map(),
      shuttingDown: false,
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

function localLeaseKey(
  namespace: string,
  subDomain: string,
  ownerId: string,
) {
  return `${namespace}::${subDomain}::${ownerId}`;
}

function subscribeKey(namespace: string, subDomain: string) {
  return `${namespace}::${subDomain}`;
}

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

function metricsFor(namespace: string): WorkerClusterMetrics {
  const entry = bus().clusters.get(namespace);
  if (!entry) return emptyMetrics();
  return entry.metrics;
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

async function ensureScripts(redis: Redis): Promise<{
  acquireSha: string;
  refreshSha: string;
}> {
  const s = bus();
  if (!s.acquireSha) {
    s.acquireSha = (await redis.script("LOAD", ACQUIRE_LEASE_LUA)) as string;
  }
  if (!s.refreshSha) {
    s.refreshSha = (await redis.script("LOAD", REFRESH_LEASE_LUA)) as string;
  }
  return { acquireSha: s.acquireSha, refreshSha: s.refreshSha };
}

function settleAck(msg: WorkerControlMessage) {
  const requestId = String(msg.requestId || "").trim();
  if (!requestId) return;
  const pending = bus().pendingAcks.get(requestId);
  if (!pending) return;

  const phase: WorkerAckPhase =
    msg.ackPhase === "accepted" || msg.ackPhase === "done"
      ? msg.ackPhase
      : "done";

  if (pending.waitFor === "accepted") {
    if (phase !== "accepted" && phase !== "done") return;
  } else if (phase !== "done") {
    return;
  }

  clearTimeout(pending.timer);
  bus().pendingAcks.delete(requestId);
  pending.resolve(msg);
}

async function publishAck(
  namespace: string,
  msg: WorkerControlMessage,
  ackPhase: WorkerAckPhase,
  ok: boolean,
  error?: string,
) {
  if (!msg.requestId) return;
  const redis = await getRedis();
  const ack: WorkerControlMessage = {
    type: "ack",
    ownerId: msg.ownerId,
    subdomain: msg.subdomain,
    fromNodeId: bus().nodeId,
    requestId: msg.requestId,
    ackPhase,
    ok,
    error: error || undefined,
    at: new Date().toISOString(),
  };
  await redis.publish(
    ackChannelKey(namespace, msg.subdomain),
    JSON.stringify(ack),
  );
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

  // Phase 1: accepted — owner is alive and will run the work
  try {
    await publishAck(parsed.namespace, msg, "accepted", true);
  } catch (err) {
    console.warn(
      "[workerCluster] failed to publish accepted ACK",
      err instanceof Error ? err.message : err,
    );
  }

  let ok = true;
  let error = "";
  try {
    await handler(msg);
  } catch (err) {
    ok = false;
    error = err instanceof Error ? err.message : String(err);
  }

  try {
    await publishAck(parsed.namespace, msg, "done", ok, error || undefined);
  } catch (err) {
    console.warn(
      "[workerCluster] failed to publish done ACK",
      err instanceof Error ? err.message : err,
    );
  }
}

async function ensureRedisBus(): Promise<void> {
  const s = bus();
  if (!s.ready) {
    s.ready = (async () => {
      const redis = await getRedis();
      await ensureScripts(redis);
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

function trackLocalLease(
  namespace: string,
  subDomain: string,
  lease: WorkerLease,
) {
  bus().localLeases.set(localLeaseKey(namespace, subDomain, lease.ownerId), {
    namespace,
    subDomain,
    ownerId: lease.ownerId,
    token: lease.token,
  });
}

function untrackLocalLease(
  namespace: string,
  subDomain: string,
  ownerId: string,
) {
  bus().localLeases.delete(localLeaseKey(namespace, subDomain, ownerId));
}

function createClusterInstance(
  options: WorkerClusterOptions,
  frozen: FrozenOptions,
  metrics: WorkerClusterMetrics,
): WorkerCluster {
  const namespace = normalizeNamespace(options.namespace);
  const { leaseTtlSec, ackTimeoutMs } = frozen;

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
    const lease = JSON.parse(raw) as WorkerLease;
    if (!lease.token) lease.token = "";
    if (!lease.meta) lease.meta = {};
    return lease;
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

  const runAcquire = async (
    subDomain: string,
    ownerId: string,
    meta: Record<string, unknown>,
    steal: boolean,
  ): Promise<{ ok: boolean; lease: WorkerLease | null; reason?: string }> => {
    const redis = await getRedis();
    const { acquireSha } = await ensureScripts(redis);
    const nodeId = bus().nodeId;
    const lease: WorkerLease = {
      ownerId,
      nodeId,
      pid: process.pid,
      updatedAt: new Date().toISOString(),
      token: randomUUID(),
      meta: { ...meta },
    };
    const result = (await redis.evalsha(
      acquireSha,
      2,
      leaseKey(namespace, subDomain, ownerId),
      busyKey(namespace, subDomain),
      nodeId,
      JSON.stringify(lease),
      String(leaseTtlSec),
      ownerId,
      steal ? "1" : "0",
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
    trackLocalLease(namespace, subDomain, lease);
    return { ok: true, lease };
  };

  const cluster: WorkerCluster = {
    namespace,
    leaseTtlSec,
    ackTimeoutMs,
    getNodeId: () => bus().nodeId,
    ensureBus,

    async acquireLease(subDomain, ownerId, meta = {}) {
      const id = String(ownerId || "").trim();
      if (!id) {
        metrics.acquireFail += 1;
        return { ok: false, lease: null, reason: "ownerId required" };
      }
      const sub = realm(subDomain);
      await ensureBus(sub);
      const result = await runAcquire(sub, id, meta, false);
      if (result.ok) metrics.acquireOk += 1;
      else metrics.acquireFail += 1;
      return result;
    },

    async reclaimLease(subDomain, ownerId, meta = {}, options = {}) {
      const id = String(ownerId || "").trim();
      if (!id) {
        metrics.reclaimFail += 1;
        return { ok: false, lease: null, reason: "ownerId required" };
      }
      const sub = realm(subDomain);
      await ensureBus(sub);

      const existing = await getLease(sub, id);
      if (existing && existing.nodeId === bus().nodeId) {
        const refreshed = await cluster.refreshLease(sub, id, meta, {
          token: existing.token,
        });
        if (refreshed) {
          const lease = await getLease(sub, id);
          metrics.reclaimOk += 1;
          return { ok: true, lease };
        }
      }

      if (existing && existing.nodeId !== bus().nodeId) {
        const forceCloseTimeoutMs = Math.max(
          500,
          Number(options.forceCloseTimeoutMs ?? Math.min(2000, ackTimeoutMs)),
        );
        try {
          await cluster.publishAndWait(
            sub,
            {
              type: "forceClose",
              ownerId: id,
              data: { reason: "reclaim", phase: "cancelled" },
            },
            { timeoutMs: forceCloseTimeoutMs, waitFor: "accepted" },
          );
        } catch {
          // Prior owner likely dead or slow — continue to steal.
        }
      }

      const stolen = await runAcquire(sub, id, meta, true);
      if (stolen.ok) metrics.reclaimOk += 1;
      else metrics.reclaimFail += 1;
      return stolen;
    },

    async refreshLease(subDomain, ownerId, metaPatch = {}, options = {}) {
      const id = String(ownerId || "").trim();
      if (!id) return false;
      const sub = realm(subDomain);
      const redis = await getRedis();
      const { refreshSha } = await ensureScripts(redis);
      const cur = await getLease(sub, id);
      if (!cur || cur.nodeId !== bus().nodeId) return false;
      if (options.token && cur.token && options.token !== cur.token) {
        return false;
      }
      const next: WorkerLease = {
        ...cur,
        meta: { ...(cur.meta || {}), ...metaPatch },
        updatedAt: new Date().toISOString(),
        pid: process.pid,
        nodeId: bus().nodeId,
        token: cur.token || randomUUID(),
      };
      const result = (await redis.evalsha(
        refreshSha,
        2,
        leaseKey(namespace, sub, id),
        busyKey(namespace, sub),
        bus().nodeId,
        JSON.stringify(next),
        String(leaseTtlSec),
        id,
        options.token || "",
      )) as [number | string, string];
      if (Number(result[0]) !== 1) return false;
      trackLocalLease(namespace, sub, next);
      return true;
    },

    async releaseLease(subDomain, ownerId, options = {}) {
      const id = String(ownerId || "").trim();
      if (!id) return false;
      const sub = realm(subDomain);
      const redis = await getRedis();
      const key = leaseKey(namespace, sub, id);
      const raw = await redis.get(key);
      if (raw) {
        const cur = JSON.parse(raw) as WorkerLease;
        if (!options.force) {
          if (cur.nodeId && cur.nodeId !== bus().nodeId) return false;
          if (
            options.token &&
            cur.token &&
            options.token !== cur.token
          ) {
            return false;
          }
        }
      }
      await redis.multi().del(key).srem(busyKey(namespace, sub), id).exec();
      untrackLocalLease(namespace, sub, id);
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
      if (!members.length) {
        metrics.busySlotsLast = 0;
        return 0;
      }
      const pipe = redis.pipeline();
      for (const oid of members) {
        pipe.exists(leaseKey(namespace, sub, oid));
      }
      const results = await pipe.exec();
      let alive = 0;
      const stale: string[] = [];
      members.forEach((oid, index) => {
        const exists = Number(results?.[index]?.[1] || 0) === 1;
        if (exists) alive += 1;
        else stale.push(oid);
      });
      if (stale.length) {
        await redis.srem(busyKey(namespace, sub), ...stale);
      }
      metrics.busySlotsLast = alive;
      return alive;
    },

    async listLeases(subDomain) {
      const redis = await getRedis();
      const sub = realm(subDomain);
      const members = await redis.smembers(busyKey(namespace, sub));
      const leases = [];
      for (const oid of members) {
        const lease = await getLease(sub, oid);
        if (!lease) continue;
        leases.push({
          ownerId: oid,
          busy: true,
          meta: lease.meta || {},
          nodeId: lease.nodeId,
          pid: lease.pid,
          updatedAt: lease.updatedAt,
          token: lease.token || "",
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
      const waitFor: WorkerAckPhase = options.waitFor || "accepted";
      const startedAt = Date.now();
      const localHandler = bus().handlers.get(
        handlerKey(namespace, sub, ownerId),
      );

      const finishOk = (ack: WorkerControlMessage) => {
        metrics.publishAndWaitOk += 1;
        metrics.controlLatencyMsSum += Date.now() - startedAt;
        metrics.controlLatencyMsCount += 1;
        return ack;
      };

      if (localHandler) {
        const fullMsg: WorkerControlMessage = {
          ...message,
          subdomain: sub,
          fromNodeId: bus().nodeId,
          requestId,
          at: new Date().toISOString(),
        };
        try {
          if (waitFor === "accepted") {
            // Accepted immediately; run work in background for local path too.
            void (async () => {
              try {
                await localHandler(fullMsg);
              } catch (err) {
                console.warn(
                  "[workerCluster] local handler error after accepted",
                  err instanceof Error ? err.message : err,
                );
              }
            })();
            return finishOk({
              type: "ack",
              ownerId,
              subdomain: sub,
              fromNodeId: bus().nodeId,
              requestId,
              ackPhase: "accepted",
              ok: true,
              at: new Date().toISOString(),
            });
          }
          await localHandler(fullMsg);
          return finishOk({
            type: "ack",
            ownerId,
            subdomain: sub,
            fromNodeId: bus().nodeId,
            requestId,
            ackPhase: "done",
            ok: true,
            at: new Date().toISOString(),
          });
        } catch (err) {
          metrics.publishAndWaitFail += 1;
          const error = err instanceof Error ? err.message : String(err);
          throw new Error(`Local control handler failed: ${error}`);
        }
      }

      const ackPromise = new Promise<WorkerControlMessage>((resolve, reject) => {
        const timer = setTimeout(() => {
          bus().pendingAcks.delete(requestId);
          metrics.publishAndWaitTimeout += 1;
          reject(
            new Error(
              `Control ACK timeout after ${timeoutMs}ms (${message.type}/${waitFor} for ${ownerId})`,
            ),
          );
        }, timeoutMs);
        bus().pendingAcks.set(requestId, {
          waitFor,
          resolve,
          reject,
          timer,
          startedAt,
        });
      });

      await publish(sub, { ...message, requestId });
      try {
        const ack = await ackPromise;
        if (ack.ok === false) {
          metrics.publishAndWaitFail += 1;
          throw new Error(
            ack.error || `Control ${message.type} failed on owner node`,
          );
        }
        return finishOk(ack);
      } catch (err) {
        if (
          err instanceof Error &&
          /ACK timeout/i.test(err.message)
        ) {
          throw err;
        }
        if (
          !(err instanceof Error && /failed on owner|Local control/i.test(err.message))
        ) {
          metrics.publishAndWaitFail += 1;
        }
        throw err;
      }
    },

    getMetrics: () => ({ ...metrics }),
    resetMetrics: () => {
      Object.assign(metrics, emptyMetrics());
    },

    async shutdown() {
      const refs = [...bus().localLeases.values()].filter(
        (r) => r.namespace === namespace,
      );
      for (const ref of refs) {
        const key = handlerKey(namespace, ref.subDomain, ref.ownerId);
        const handler = bus().handlers.get(key);
        if (handler) {
          try {
            await handler({
              type: "forceClose",
              ownerId: ref.ownerId,
              subdomain: ref.subDomain,
              fromNodeId: bus().nodeId,
              data: { reason: "shutdown", phase: "cancelled" },
              at: new Date().toISOString(),
            });
          } catch (err) {
            console.warn(
              "[workerCluster] shutdown forceClose failed",
              ref.ownerId,
              err instanceof Error ? err.message : err,
            );
          }
        }
        await cluster
          .releaseLease(ref.subDomain, ref.ownerId, {
            token: ref.token,
            force: true,
          })
          .catch(() => {});
        cluster.unregisterHandler(ref.subDomain, ref.ownerId);
        metrics.shutdownReleases += 1;
      }
    },
  };

  return cluster;
}

/**
 * Create or reuse a namespaced worker cluster coordinator.
 * Same namespace returns the same instance. Explicit option mismatches throw.
 */
export function createWorkerCluster(
  options: WorkerClusterOptions,
): WorkerCluster {
  const namespace = normalizeNamespace(options.namespace);
  const leaseTtlSec = Math.max(
    30,
    Number(
      options.leaseTtlSec !== undefined
        ? options.leaseTtlSec
        : DEFAULT_LEASE_TTL_SEC,
    ),
  );
  const ackTimeoutMs = Math.max(
    1000,
    Number(
      options.ackTimeoutMs !== undefined
        ? options.ackTimeoutMs
        : DEFAULT_ACK_TIMEOUT_MS,
    ),
  );
  const s = bus();
  const existing = s.clusters.get(namespace);
  if (existing) {
    const explicitTtl = options.leaseTtlSec !== undefined;
    const explicitAck = options.ackTimeoutMs !== undefined;
    if (
      (explicitTtl && existing.options.leaseTtlSec !== leaseTtlSec) ||
      (explicitAck && existing.options.ackTimeoutMs !== ackTimeoutMs)
    ) {
      throw new Error(
        `workerCluster("${namespace}") already created with leaseTtlSec=${existing.options.leaseTtlSec}, ackTimeoutMs=${existing.options.ackTimeoutMs}; refusing options leaseTtlSec=${leaseTtlSec}, ackTimeoutMs=${ackTimeoutMs}`,
      );
    }
    return existing.cluster;
  }

  const frozen: FrozenOptions = { leaseTtlSec, ackTimeoutMs };
  const metrics = emptyMetrics();
  const cluster = createClusterInstance(
    { ...options, namespace },
    frozen,
    metrics,
  );
  s.clusters.set(namespace, { cluster, options: frozen, metrics });
  return cluster;
}

export function getWorkerNodeId(): string {
  return bus().nodeId;
}

/**
 * Release local leases and run forceClose handlers for every namespace.
 * Call from the app SIGTERM/SIGINT path (e.g. initWorkersCore).
 */
export async function shutdownAllWorkerClusters(): Promise<void> {
  const s = bus();
  if (s.shuttingDown) return;
  s.shuttingDown = true;
  try {
    for (const entry of s.clusters.values()) {
      await entry.cluster.shutdown();
    }
  } finally {
    s.shuttingDown = false;
  }
}
