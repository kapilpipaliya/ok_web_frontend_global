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
 * Zoom facade over workerCluster. Requires Redis.
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

test.describe("askzoomPlaywrightCluster facade", () => {
  test.beforeAll(async () => {
    test.skip(!(await redisUp()), "Redis not available");
  });

  test.afterEach(async () => {
    unregisterAskzoomControlHandler(SUB, USER);
    await releaseAskzoomLease(SUB, USER).catch(() => {});
  });

  test("maps userId lease fields", async () => {
    const first = await acquireAskzoomLease(SUB, USER, {
      jobAction: "manage",
      managing: true,
    });
    expect(first.ok).toBe(true);
    expect(first.lease?.userId).toBe(USER);
    expect(first.lease?.jobAction).toBe("manage");
    expect(first.lease?.managing).toBe(true);
    expect(first.lease?.nodeId).toBe(getAskzoomNodeId());

    const lease = await getAskzoomLease(SUB, USER);
    expect(lease?.managing).toBe(true);
  });

  test("publishControlAndWait maps control data fields", async () => {
    let phase = "";
    registerAskzoomControlHandler(SUB, USER, async (msg) => {
      if (msg.type === "cancel") {
        phase = msg.phase || "";
        return;
      }
      throw new Error(`unexpected ${msg.type}`);
    });

    const ack = await publishAskzoomControlAndWait(SUB, {
      type: "cancel",
      userId: USER,
      phase: "cancelled",
      message: "test",
    });
    expect(ack.ok).toBe(true);
    expect(phase).toBe("cancelled");
  });
});
