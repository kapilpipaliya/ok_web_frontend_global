import { describe, it, expect } from "vitest";
import { getExistingOrDefaultTxnValue } from "./getExistingOrDefaultTxnValue";
import { getDefaultTxnValue } from "./getDefaultTxnValue";
import { graphWithTxn } from "../__tests__/fixtures";

describe("getExistingOrDefaultTxnValue", () => {
  it("returns default when txnId is falsy", () => {
    const { graph } = graphWithTxn(1);
    expect(getExistingOrDefaultTxnValue(0, graph)).toEqual(getDefaultTxnValue());
  });

  it("returns default when txn vertex is missing", () => {
    const { graph } = graphWithTxn(1);
    expect(getExistingOrDefaultTxnValue(99, graph)).toEqual(getDefaultTxnValue());
  });

  it("returns a deep clone of txn vertex properties", () => {
    const { graph } = graphWithTxn(1, {
      activeUndoIndex: 2,
      steps: [{ id: "s1", data: {}, originalData: {} } as never],
    });
    const value = getExistingOrDefaultTxnValue(1, graph);
    expect(value.activeUndoIndex).toBe(2);
    expect(value.steps).toHaveLength(1);
    value.activeUndoIndex = 99;
    expect(graph.vertexes.txn1.P.activeUndoIndex).toBe(2);
  });
});
