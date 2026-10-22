import { describe, it, expect } from "vitest";
import { transactionDetailAdd } from "./transactionDetailAdd";
import { graphWithTxn, mockStep } from "../__tests__/fixtures";

describe("transactionDetailAdd", () => {
  it("no-ops for falsy txnId", () => {
    const { graph, setGraph } = graphWithTxn(1);
    transactionDetailAdd(0, mockStep({ id: "a" }), graph, setGraph);
    expect(graph.vertexes.txn1.P.steps).toEqual([]);
  });

  it("appends a step and advances activeUndoIndex", () => {
    const { graph, setGraph } = graphWithTxn(1, {
      activeUndoIndex: -1,
      submittedIndex: -1,
      originalSubmittedIndex: -1,
    });
    const step = mockStep({ id: "step1" });

    transactionDetailAdd(1, step, graph, setGraph);

    const txn = graph.vertexes.txn1.P;
    expect(txn.steps).toHaveLength(1);
    expect(txn.steps[0].id).toBe("step1");
    expect(txn.activeUndoIndex).toBe(0);
    expect(txn.status).toBe("modified");
  });

  it("truncates future branch and stores revertSteps when adding after undo", () => {
    const step0 = mockStep({ id: "s0" });
    const step1 = mockStep({ id: "s1" });
    const step2 = mockStep({ id: "s2" });
    const { graph, setGraph } = graphWithTxn(1, {
      steps: [step0, step1, step2],
      activeUndoIndex: 0,
      submittedIndex: 2,
      originalSubmittedIndex: 2,
      undoStepIndexes: [0, 2],
    });

    transactionDetailAdd(1, mockStep({ id: "branch" }), graph, setGraph);

    const txn = graph.vertexes.txn1.P;
    expect(txn.steps.map((s) => s.id)).toEqual(["s0", "branch"]);
    expect(txn.activeUndoIndex).toBe(1);
    expect(txn.submittedIndex).toBe(0);
    expect(txn.originalSubmittedIndex).toBe(0);
    expect(txn.revertSteps.map((s) => s.id)).toEqual(["s1", "s2"]);
    expect(txn.undoStepIndexes).toEqual([0]);
  });
});
