import { describe, it, expect } from "vitest";
import { saveUndoPoint } from "./saveUndoPoint";
import { graphWithTxn } from "../__tests__/fixtures";

describe("saveUndoPoint", () => {
  it("no-ops for falsy txnId", () => {
    const { graph, setGraph } = graphWithTxn(1, { activeUndoIndex: 1 });
    saveUndoPoint(0, graph, setGraph);
    expect(graph.vertexes.txn1.P.undoStepIndexes).toEqual([]);
  });

  it("appends active index when not present", () => {
    const { graph, setGraph } = graphWithTxn(1, { activeUndoIndex: 2 });
    saveUndoPoint(1, graph, setGraph);
    expect(graph.vertexes.txn1.P.undoStepIndexes).toEqual([2]);
  });

  it("does not duplicate existing undo point", () => {
    const { graph, setGraph } = graphWithTxn(1, {
      activeUndoIndex: 2,
      undoStepIndexes: [2],
    });
    saveUndoPoint(1, graph, setGraph);
    expect(graph.vertexes.txn1.P.undoStepIndexes).toEqual([2]);
  });

  it("inserts undo point in sorted order", () => {
    const { graph, setGraph } = graphWithTxn(1, {
      activeUndoIndex: 1,
      undoStepIndexes: [0, 3],
    });
    saveUndoPoint(1, graph, setGraph);
    expect(graph.vertexes.txn1.P.undoStepIndexes).toEqual([0, 1, 3]);
  });
});
