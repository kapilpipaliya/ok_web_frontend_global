import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { updateSubmittedIndex } from "./updateSubmittedIndex";
import { graphWithTxn } from "../__tests__/fixtures";

describe("updateSubmittedIndex", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2020-01-01T00:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("no-ops for falsy txnId", () => {
    const { graph, setGraph } = graphWithTxn(1, { activeUndoIndex: 2 });
    updateSubmittedIndex(0, graph, setGraph);
    expect(graph.vertexes.txn1.P.submittedIndex).toBe(-1);
  });

  it("marks current undo position as committed baseline", () => {
    const { graph, setGraph } = graphWithTxn(1, {
      activeUndoIndex: 3,
      submittedIndex: 1,
      originalSubmittedIndex: 1,
      revertSteps: [{ id: "x" } as never],
      status: "modified",
      error: { code: "X", message: "fail" },
    });

    updateSubmittedIndex(1, graph, setGraph);

    const txn = graph.vertexes.txn1.P;
    expect(txn.submittedIndex).toBe(3);
    expect(txn.originalSubmittedIndex).toBe(3);
    expect(txn.revertSteps).toEqual([]);
    expect(txn.status).toBe("committed");
    expect(txn.lastModified).toBe(Date.parse("2020-01-01T00:00:00Z"));
    expect(txn.error).toBeUndefined();
  });
});
