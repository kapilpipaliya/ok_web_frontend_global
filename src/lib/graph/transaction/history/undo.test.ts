import { describe, it, expect, vi, beforeEach } from "vitest";
import { undo, undoAllowed } from "./undo";
import { graphWithTxn, mergeStep, mockStep } from "../__tests__/fixtures";
import { createVertex } from "~/lib/graph/__tests__/helpers/createTestGraph";

describe("undoAllowed", () => {
  it("returns false for invalid txn or empty steps", () => {
    const { graph } = graphWithTxn(1);
    expect(undoAllowed(0, graph)).toBe(false);
    expect(undoAllowed(99, graph)).toBe(false);
    expect(undoAllowed(1, graph)).toBe(false);
  });

  it("respects preventUndoBeforeIndex", () => {
    const { graph } = graphWithTxn(1, {
      steps: [mockStep({ id: "a" }), mockStep({ id: "b" })],
      activeUndoIndex: 1,
      preventUndoBeforeIndex: 1,
    });
    expect(undoAllowed(1, graph)).toBe(false);
    expect(undoAllowed(1, graph, 0)).toBe(false);
  });

  it("returns true when undo is possible", () => {
    const { graph } = graphWithTxn(1, {
      steps: [mockStep({ id: "a" }), mockStep({ id: "b" })],
      activeUndoIndex: 1,
    });
    expect(undoAllowed(1, graph)).toBe(true);
  });
});

describe("undo", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("no-ops when undo is not allowed", () => {
    const { graph, setGraph } = graphWithTxn(1);
    undo(1, graph, setGraph);
    expect(graph.vertexes.txn1.P.activeUndoIndex).toBe(-1);
  });

  it("reverts one step by default and adjusts submittedIndex", () => {
    const target = createVertex("v1", ["Page"], { title: "after" });
    const original = createVertex("v1", ["Page"], { title: "before" });
    const { graph, setGraph } = graphWithTxn(1, {
      steps: [mergeStep("v1", target, original)],
      activeUndoIndex: 0,
      submittedIndex: 0,
      originalSubmittedIndex: 0,
      status: "committed",
    }, { v1: createVertex("v1", ["Page"], { title: "after" }) });

    undo(1, graph, setGraph);

    expect(graph.vertexes.v1.P.title).toBe("before");
    expect(graph.vertexes.txn1.P.activeUndoIndex).toBe(-1);
    expect(graph.vertexes.txn1.P.submittedIndex).toBe(-1);
    expect(graph.vertexes.txn1.P.status).toBe("reverted");
    expect(graph.vertexes.txn1.P.undoStepIndexes).toContain(0);
  });

  it("reverts to explicit index and optionally removes trailing steps", () => {
    const { graph, setGraph } = graphWithTxn(1, {
      steps: [
        mockStep({ id: "a" }),
        mockStep({ id: "b" }),
        mockStep({ id: "c" }),
      ],
      activeUndoIndex: 2,
      submittedIndex: 2,
      originalSubmittedIndex: 2,
    });

    undo(1, graph, setGraph, 0, true);

    expect(graph.vertexes.txn1.P.steps).toHaveLength(1);
    expect(graph.vertexes.txn1.P.activeUndoIndex).toBe(0);
    expect(graph.vertexes.txn1.P.submittedIndex).toBe(0);
    expect(graph.vertexes.txn1.P.originalSubmittedIndex).toBe(0);
  });
});
