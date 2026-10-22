import { describe, it, expect, vi, beforeEach } from "vitest";
import { redo, redoAllowed } from "./redo";
import { graphWithTxn, mergeStep } from "../__tests__/fixtures";
import { createVertex } from "~/lib/graph/__tests__/helpers/createTestGraph";

describe("redoAllowed", () => {
  it("returns false for invalid txn", () => {
    const { graph } = graphWithTxn(1);
    expect(redoAllowed(0, graph)).toBe(false);
    expect(redoAllowed(99, graph)).toBe(false);
  });

  it("returns true when active index is before last step", () => {
    const { graph } = graphWithTxn(1, {
      steps: [
        mergeStep(
          "v1",
          createVertex("v1", ["Page"], { n: 2 }),
          createVertex("v1", ["Page"], { n: 1 }),
        ),
        mergeStep(
          "v1",
          createVertex("v1", ["Page"], { n: 3 }),
          createVertex("v1", ["Page"], { n: 2 }),
        ),
      ],
      activeUndoIndex: 0,
    });
    expect(redoAllowed(1, graph)).toBe(true);
  });

  it("returns false at end of history", () => {
    const { graph } = graphWithTxn(1, {
      steps: [mergeStep("v1", createVertex("v1", ["Page"], {}), createVertex("v1", ["Page"], {}))],
      activeUndoIndex: 0,
    });
    expect(redoAllowed(1, graph)).toBe(false);
  });
});

describe("redo", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("no-ops when redo is not allowed", () => {
    const { graph, setGraph } = graphWithTxn(1, { activeUndoIndex: -1 });
    redo(1, graph, setGraph);
    expect(graph.vertexes.txn1.P.activeUndoIndex).toBe(-1);
  });

  it("redoes to next checkpoint and restores submittedIndex when applicable", () => {
    const step0 = mergeStep(
      "v1",
      createVertex("v1", ["Page"], { n: 1 }),
      createVertex("v1", ["Page"], {}),
    );
    const step1 = mergeStep(
      "v1",
      createVertex("v1", ["Page"], { n: 2 }),
      createVertex("v1", ["Page"], { n: 1 }),
    );
    const { graph, setGraph } = graphWithTxn(
      1,
      {
        steps: [step0, step1],
        activeUndoIndex: -1,
        submittedIndex: -1,
        originalSubmittedIndex: 1,
        undoStepIndexes: [0, 1],
        status: "reverted",
      },
      { v1: createVertex("v1", ["Page"], {}) },
    );

    redo(1, graph, setGraph);

    expect(graph.vertexes.v1.P.n).toBe(1);
    expect(graph.vertexes.txn1.P.activeUndoIndex).toBe(0);
    expect(graph.vertexes.txn1.P.submittedIndex).toBe(0);

    redo(1, graph, setGraph);
    expect(graph.vertexes.v1.P.n).toBe(2);
    expect(graph.vertexes.txn1.P.activeUndoIndex).toBe(1);
    expect(graph.vertexes.txn1.P.submittedIndex).toBe(1);
  });
});
