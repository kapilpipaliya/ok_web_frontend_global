import { describe, expect, it } from "vitest";
import {
  ACTION_ITEMS_LENGTH_CHANGE,
  ACTION_VIEWPORT_RESIZE,
  createVirtualStore,
} from "./store.js";

describe("createVirtualStore", () => {
  describe("getRange", () => {
    it("should return valid range when viewport becomes 0 after removing all items", () => {
      const { actions } = createVirtualStore(10, 50);

      // Viewport gets measured
      actions.update(ACTION_VIEWPORT_RESIZE, 500);
      actions.getRange();

      // Remove all items - this can cause internal _prevRange to become [-1, -1]
      actions.update(ACTION_ITEMS_LENGTH_CHANGE, [0, false]);
      actions.getRange();

      // Viewport collapses to 0
      actions.update(ACTION_VIEWPORT_RESIZE, 0);

      // getRange should return a valid range, not [-1, -1]
      const range = actions.getRange();
      expect(range[0]).toBeGreaterThanOrEqual(0);
    });
  });
});
