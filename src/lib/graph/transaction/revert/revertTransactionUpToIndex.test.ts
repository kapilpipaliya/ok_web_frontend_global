import { describe, it, expect, vi, beforeEach } from "vitest";
import { revertTransactionUpToIndex } from "./revertTransactionUpToIndex";
import { graphWithTxn, mockStep } from "../__tests__/fixtures";

describe("revertTransactionUpToIndex", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("delegates to undo with removeAfterSteps", () => {
    const { graph, setGraph } = graphWithTxn(1, {
      steps: [mockStep({ id: "a" }), mockStep({ id: "b" })],
      activeUndoIndex: 1,
    });

    revertTransactionUpToIndex(1, 0, graph, setGraph);

    expect(graph.vertexes.txn1.P.steps).toHaveLength(1);
    expect(graph.vertexes.txn1.P.activeUndoIndex).toBe(0);
  });
});
