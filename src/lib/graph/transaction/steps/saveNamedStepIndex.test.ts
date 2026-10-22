import { describe, it, expect } from "vitest";
import { saveNamedStepIndex } from "./saveNamedStepIndex";
import { graphWithTxn } from "../__tests__/fixtures";

describe("saveNamedStepIndex", () => {
  it("no-ops for falsy txnId", () => {
    const { graph, setGraph } = graphWithTxn(1, { activeUndoIndex: 2 });
    saveNamedStepIndex(0, "checkpoint", graph, setGraph);
    expect(graph.vertexes.txn1.P.namedUndoStepIndexes).toEqual({});
  });

  it("stores activeUndoIndex under key", () => {
    const { graph, setGraph } = graphWithTxn(1, { activeUndoIndex: 3 });
    saveNamedStepIndex(1, "initial", graph, setGraph);
    expect(graph.vertexes.txn1.P.namedUndoStepIndexes.initial).toBe(3);
  });
});
