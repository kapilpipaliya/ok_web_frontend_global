import { expect, test } from "@playwright/test";
import {
  acquireAskzoomLease,
  ensureAskzoomControlBus,
  getAskzoomLease,
  getAskzoomNodeId,
  publishAskzoomControlAndWait,
  registerAskzoomControlHandler,
  releaseAskzoomLease,
  unregisterAskzoomControlHandler,
} from "~/lib/zoom/askzoomPlaywrightCluster";

/**
 * Requires Redis. Skips when Redis is unreachable.
 */
const SUB = `askzoom-cluster-test-${Date.now()}`;
const USER = `user-${Date.now()}`;

async function redisUp() {
  try {
    await ensureAskzoomControlBus(SUB);
    return true;
  } catch {
    return false;
  }
}

test.describe("askzoomPlaywrightCluster", () => {
  test.beforeAll(async () => {
    test.skip(!(await redisUp()), "Redis not available");
  });

  test.afterEach(async () => {
    unregisterAskzoomControlHandler(SUB, USER);
    await releaseAskzoomLease(SUB, USER).catch(() => {});
  });

  test("atomic lease is owned by stable nodeId", async () => {
    const first = await acquireAskzoomLease(SUB, USER, { jobAction: "manage" });
    expect(first.ok).toBe(true);
    expect(first.lease?.nodeId).toBe(getAskzoomNodeId());

    const again = await acquireAskzoomLease(SUB, USER, { jobAction: "manage" });
    expect(again.ok).toBe(true);

    const lease = await getAskzoomLease(SUB, USER);
    expect(lease?.userId).toBe(USER);
    expect(lease?.nodeId).toBe(getAskzoomNodeId());
  });

  test("publishControlAndWait ACKs via local handler", async () => {
    let handled = "";
    registerAskzoomControlHandler(SUB, USER, async (msg) => {
      handled = msg.type;
      if (msg.type === "cancel") return;
      throw new Error(`unexpected ${msg.type}`);
    });

    const ack = await publishAskzoomControlAndWait(SUB, {
      type: "cancel",
      userId: USER,
      phase: "cancelled",
      message: "test",
    });
    expect(ack.ok).toBe(true);
    expect(handled).toBe("cancel");
  });

  test("publishControlAndWait times out without owner handler", async () => {
    await expect(
      publishAskzoomControlAndWait(
        SUB,
        { type: "forceClose", userId: `${USER}-missing` },
        { timeoutMs: 500 },
      ),
    ).rejects.toThrow(/ACK timeout/i);
  });
});
