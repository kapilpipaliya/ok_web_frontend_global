import { describe, it, expect, vi, beforeEach } from "vitest";
import { resetTransaction } from "./resetTransaction";
import { graphWithTxn, mockStep } from "../__tests__/fixtures";
import { saveNamedStepIndex } from "../steps/saveNamedStepIndex";

describe("resetTransaction", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("no-ops when initial named index is missing", () => {
    const { graph, setGraph } = graphWithTxn(1, {
      steps: [mockStep({ id: "a" })],
      activeUndoIndex: 0,
    });
    resetTransaction(1, graph, setGraph);
    expect(graph.vertexes.txn1.P.steps).toHaveLength(1);
  });

  it("reverts up to one step before initial named index", () => {
    const { graph, setGraph } = graphWithTxn(1, {
      steps: [mockStep({ id: "a" }), mockStep({ id: "b" })],
      activeUndoIndex: 1,
      submittedIndex: 1,
      originalSubmittedIndex: 1,
    });
    saveNamedStepIndex(1, "initial", graph, setGraph);
    setGraph((d) => {
      d.vertexes.txn1.P.namedUndoStepIndexes.initial = 1;
    });

    resetTransaction(1, graph, setGraph);

    expect(graph.vertexes.txn1.P.steps).toHaveLength(1);
    expect(graph.vertexes.txn1.P.activeUndoIndex).toBe(0);
  });
});
