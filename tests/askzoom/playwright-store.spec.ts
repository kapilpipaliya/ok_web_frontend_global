import { expect, test } from "@playwright/test";
import {
  clearAllSlots,
  countBusySlots,
  createEmptySlot,
  deleteSlotIfIdle,
  getSlot,
  listSlots,
} from "~/lib/zoom/askzoomPlaywrightStore";

const SUB = `test-askzoom-${Date.now()}`;

test.describe("askzoomPlaywrightStore", () => {
  test.afterEach(() => {
    clearAllSlots(SUB);
  });

  test("keys slots by userId and counts busy browsers", () => {
    const a = getSlot(SUB, "user-a");
    const b = getSlot(SUB, "user-b");
    expect(a?.ownerUserId).toBe("user-a");
    expect(b?.ownerUserId).toBe("user-b");
    expect(countBusySlots(SUB)).toBe(0);

    a!.browser = { close: async () => {} };
    expect(countBusySlots(SUB)).toBe(1);
    expect(listSlots(SUB).filter((s) => s.busy)).toHaveLength(1);
  });

  test("deleteSlotIfIdle removes closed slots only", () => {
    const slot = getSlot(SUB, "user-c")!;
    slot.browser = { close: async () => {} };
    expect(deleteSlotIfIdle(SUB, "user-c")).toBe(false);

    slot.browser = null;
    slot.managing = false;
    expect(deleteSlotIfIdle(SUB, "user-c")).toBe(true);
    expect(getSlot(SUB, "user-c", { create: false })).toBeNull();
  });

  test("createEmptySlot defaults", () => {
    const slot = createEmptySlot("x");
    expect(slot.ownerUserId).toBe("x");
    expect(slot.managing).toBe(false);
    expect(slot.recordVideo).toBe(true);
    expect(slot.closing).toBe(false);
  });
});
