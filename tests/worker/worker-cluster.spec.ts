import { expect, test } from "@playwright/test";
import { createWorkerCluster } from "~/lib/worker/workerCluster";

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
    await cluster.releaseLease(SUB, OWNER).catch(() => {});
  });

  test("atomic lease is owned by stable nodeId", async () => {
    const first = await cluster.acquireLease(SUB, OWNER, { job: "a" });
    expect(first.ok).toBe(true);
    expect(first.lease?.nodeId).toBe(cluster.getNodeId());
    expect(first.lease?.meta.job).toBe("a");

    const again = await cluster.acquireLease(SUB, OWNER, { job: "b" });
    expect(again.ok).toBe(true);

    const lease = await cluster.getLease(SUB, OWNER);
    expect(lease?.ownerId).toBe(OWNER);
    expect(lease?.nodeId).toBe(cluster.getNodeId());
    expect(cluster.isLeaseOwner(lease)).toBe(true);
  });

  test("publishAndWait ACKs via local handler", async () => {
    let handled = "";
    cluster.registerHandler(SUB, OWNER, async (msg) => {
      handled = msg.type;
      if (msg.type === "cancel") return;
      throw new Error(`unexpected ${msg.type}`);
    });

    const ack = await cluster.publishAndWait(SUB, {
      type: "cancel",
      ownerId: OWNER,
      data: { reason: "test" },
    });
    expect(ack.ok).toBe(true);
    expect(handled).toBe("cancel");
  });

  test("publishAndWait times out without owner handler", async () => {
    await expect(
      cluster.publishAndWait(
        SUB,
        { type: "forceClose", ownerId: `${OWNER}-missing` },
        { timeoutMs: 500 },
      ),
    ).rejects.toThrow(/ACK timeout/i);
  });

  test("same namespace reuses instance", () => {
    const again = createWorkerCluster({ namespace: NS });
    expect(again).toBe(cluster);
  });
});
