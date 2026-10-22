import { describe, it, expect } from "vitest";
import { setPreventUndoAtOrBeforeIndex } from "./setPreventUndoAtOrBeforeIndex";
import { graphWithTxn } from "../__tests__/fixtures";

describe("setPreventUndoAtOrBeforeIndex", () => {
  it("no-ops for falsy txnId", () => {
    const { graph, setGraph } = graphWithTxn(1, { activeUndoIndex: 5 });
    setPreventUndoAtOrBeforeIndex(0, graph, setGraph);
    expect(graph.vertexes.txn1.P.preventUndoBeforeIndex).toBe(-1);
  });

  it("sets preventUndoBeforeIndex to activeUndoIndex", () => {
    const { graph, setGraph } = graphWithTxn(1, { activeUndoIndex: 4 });
    setPreventUndoAtOrBeforeIndex(1, graph, setGraph);
    expect(graph.vertexes.txn1.P.preventUndoBeforeIndex).toBe(4);
  });
});
