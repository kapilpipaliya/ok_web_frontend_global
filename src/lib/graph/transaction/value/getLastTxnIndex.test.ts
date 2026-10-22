import { describe, it, expect } from "vitest";
import { getLastTxnIndex } from "./getLastTxnIndex";
import { graphWithTxn, mockStep } from "../__tests__/fixtures";

describe("getLastTxnIndex", () => {
  it("returns -1 when there are no steps", () => {
    const { graph } = graphWithTxn(1);
    expect(getLastTxnIndex(1, graph)).toBe(-1);
  });

  it("returns last step index", () => {
    const { graph } = graphWithTxn(1, {
      steps: [mockStep({ id: "a" }), mockStep({ id: "b" })],
    });
    expect(getLastTxnIndex(1, graph)).toBe(1);
  });
});
