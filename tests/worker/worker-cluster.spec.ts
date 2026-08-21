import { expect, test } from "@playwright/test";
import Redis from "ioredis";
import {
  createWorkerCluster,
  type WorkerControlMessage,
} from "~/lib/worker/workerCluster";

/**
 * Requires Redis. Skips when Redis is unreachable.
 */
const NS = `test-worker-${Date.now()}`;
const SUB = `sub-${Date.now()}`;
const OWNER = `owner-${Date.now()}`;

const cluster = createWorkerCluster({
  namespace: NS,
  leaseTtlSec: 60,
  ackTimeoutMs: 5000,
});

function redisClient() {
  return new Redis({
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379", 10),
    password: process.env.REDIS_PASSWORD || undefined,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    lazyConnect: true,
  });
}

async function redisUp() {
  try {
    await cluster.ensureBus(SUB);
    return true;
  } catch {
    return false;
  }
}

test.describe("workerCluster", () => {
  test.beforeAll(async () => {
    test.skip(!(await redisUp()), "Redis not available");
  });

  test.afterEach(async () => {
    cluster.unregisterHandler(SUB, OWNER);
    await cluster.releaseLease(SUB, OWNER, { force: true }).catch(() => {});
    cluster.resetMetrics();
  });

  test("atomic lease is owned by stable nodeId", async () => {
    const first = await cluster.acquireLease(SUB, OWNER, { job: "a" });
    expect(first.ok).toBe(true);
    expect(first.lease?.nodeId).toBe(cluster.getNodeId());
    expect(first.lease?.meta.job).toBe("a");
    expect(first.lease?.token).toBeTruthy();

    const again = await cluster.acquireLease(SUB, OWNER, { job: "b" });
    expect(again.ok).toBe(true);

    const lease = await cluster.getLease(SUB, OWNER);
    expect(lease?.ownerId).toBe(OWNER);
    expect(lease?.nodeId).toBe(cluster.getNodeId());
    expect(cluster.isLeaseOwner(lease)).toBe(true);
  });

  test("publishAndWait defaults to accepted ACK (two-phase)", async () => {
    let started = false;
    let finished = false;
    cluster.registerHandler(SUB, OWNER, async () => {
      started = true;
      await new Promise((r) => setTimeout(r, 80));
      finished = true;
    });

    const t0 = Date.now();
    const ack = await cluster.publishAndWait(SUB, {
      type: "cancel",
      ownerId: OWNER,
    });
    const elapsed = Date.now() - t0;
    expect(ack.ok).toBe(true);
    expect(ack.ackPhase).toBe("accepted");
    expect(elapsed).toBeLessThan(200);
    await expect.poll(() => started).toBe(true);
    await expect.poll(() => finished).toBe(true);
  });

  test("publishAndWait waitFor done waits for completion", async () => {
    cluster.registerHandler(SUB, OWNER, async () => {
      await new Promise((r) => setTimeout(r, 50));
    });
    const ack = await cluster.publishAndWait(
      SUB,
      { type: "cancel", ownerId: OWNER },
      { waitFor: "done" },
    );
    expect(ack.ackPhase).toBe("done");
    expect(ack.ok).toBe(true);
  });

  test("publishAndWait times out without owner handler", async () => {
    await expect(
      cluster.publishAndWait(
        SUB,
        { type: "forceClose", ownerId: `${OWNER}-missing` },
        { timeoutMs: 500 },
      ),
    ).rejects.toThrow(/ACK timeout/i);
    expect(cluster.getMetrics().publishAndWaitTimeout).toBeGreaterThan(0);
  });

  test("same namespace reuses instance; explicit option mismatch throws", () => {
    const again = createWorkerCluster({ namespace: NS });
    expect(again).toBe(cluster);
    expect(() =>
      createWorkerCluster({ namespace: NS, leaseTtlSec: 120 }),
    ).toThrow(/already created/);
  });

  test("reclaimLease steals after dead-owner forceClose timeout", async () => {
    const redis = redisClient();
    await redis.connect();
    const key = `worker:${NS}:lease:${SUB}:${OWNER}`;
    const busy = `worker:${NS}:busy:${SUB}`;
    await redis.set(
      key,
      JSON.stringify({
        ownerId: OWNER,
        nodeId: "dead-node-xyz",
        pid: 1,
        updatedAt: new Date().toISOString(),
        token: "old-token",
        meta: { job: "stuck" },
      }),
      "EX",
      60,
    );
    await redis.sadd(busy, OWNER);
    await redis.quit();

    const reclaimed = await cluster.reclaimLease(SUB, OWNER, { job: "new" });
    expect(reclaimed.ok).toBe(true);
    expect(reclaimed.lease?.nodeId).toBe(cluster.getNodeId());
    expect(reclaimed.lease?.meta.job).toBe("new");
    expect(cluster.getMetrics().reclaimOk).toBeGreaterThan(0);
  });

  test("cross-process: remote subscriber ACKs cancel from this node", async () => {
    const remoteOwner = `${OWNER}-remote`;
    const ctrlChannel = `worker:${NS}:ctrl:${SUB}`;
    const ackChannel = `worker:${NS}:ack:${SUB}`;
    let remoteSawType = "";

    const sub = redisClient();
    await sub.connect();
    await sub.subscribe(ctrlChannel);
    sub.on("message", async (channel, raw) => {
      if (channel !== ctrlChannel) return;
      let msg: WorkerControlMessage;
      try {
        msg = JSON.parse(raw);
      } catch {
        return;
      }
      if (msg.ownerId !== remoteOwner || !msg.requestId) return;
      remoteSawType = msg.type;
      const pub = redisClient();
      await pub.connect();
      const base = {
        type: "ack",
        ownerId: remoteOwner,
        subdomain: SUB,
        fromNodeId: "fake-remote-node",
        requestId: msg.requestId,
        ok: true,
        at: new Date().toISOString(),
      };
      await pub.publish(
        ackChannel,
        JSON.stringify({ ...base, ackPhase: "accepted" }),
      );
      await pub.publish(
        ackChannel,
        JSON.stringify({ ...base, ackPhase: "done" }),
      );
      await pub.quit();
    });

    // Ensure local bus is subscribed before publishing
    await cluster.ensureBus(SUB);
    await new Promise((r) => setTimeout(r, 50));

    const ack = await cluster.publishAndWait(
      SUB,
      { type: "cancel", ownerId: remoteOwner, data: { reason: "e2e" } },
      { timeoutMs: 3000, waitFor: "accepted" },
    );
    expect(ack.ok).toBe(true);
    expect(remoteSawType).toBe("cancel");
    expect(ack.fromNodeId).toBe("fake-remote-node");

    await sub.unsubscribe(ctrlChannel);
    await sub.quit();
  });

  test("shutdown releases local leases and runs forceClose handler", async () => {
    let closed = false;
    const acquired = await cluster.acquireLease(SUB, OWNER, { job: "x" });
    expect(acquired.ok).toBe(true);
    cluster.registerHandler(SUB, OWNER, async (msg) => {
      if (msg.type === "forceClose") closed = true;
    });
    await cluster.shutdown();
    expect(closed).toBe(true);
    expect(await cluster.getLease(SUB, OWNER)).toBeNull();
    expect(cluster.getMetrics().shutdownReleases).toBeGreaterThan(0);
  });

  test("metrics track acquire success", async () => {
    cluster.resetMetrics();
    await cluster.acquireLease(SUB, OWNER);
    const m = cluster.getMetrics();
    expect(m.acquireOk).toBe(1);
  });
});
