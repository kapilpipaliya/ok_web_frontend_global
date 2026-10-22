import { describe, it, expect } from "vitest";
import { getNamedIndex } from "./getNamedIndex";
import { graphWithTxn } from "../__tests__/fixtures";

describe("getNamedIndex", () => {
  it("returns undefined for falsy txnId", () => {
    const { graph } = graphWithTxn(1);
    expect(getNamedIndex(0, "initial", graph)).toBeUndefined();
  });

  it("returns undefined when txn vertex is missing", () => {
    const { graph } = graphWithTxn(1);
    expect(getNamedIndex(99, "initial", graph)).toBeUndefined();
  });

  it("returns stored named index", () => {
    const { graph } = graphWithTxn(1, {
      namedUndoStepIndexes: { initial: 0, checkpoint: 3 },
    });
    expect(getNamedIndex(1, "initial", graph)).toBe(0);
    expect(getNamedIndex(1, "checkpoint", graph)).toBe(3);
  });
});
