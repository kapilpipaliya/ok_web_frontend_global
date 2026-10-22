import { describe, it, expect, vi, beforeEach } from "vitest";
import { commitTxn } from "./commitTxn";
import { createVertex } from "~/lib/graph/__tests__/helpers/createTestGraph";
import { graphWithTxn, insertStep, mockStep } from "../__tests__/fixtures";

describe("commitTxn", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("returns undefined when validation fails", () => {
    const { graph } = graphWithTxn(1);
    expect(commitTxn(0, graph)).toBeUndefined();
    expect(commitTxn(99, graph)).toBeUndefined();
  });

  it("returns undefined when there are no changes to commit", () => {
    const { graph } = graphWithTxn(1, {
      activeUndoIndex: 1,
      submittedIndex: 1,
      originalSubmittedIndex: 1,
      revertSteps: [],
      status: "committed",
      steps: [mockStep({ id: "a" }), mockStep({ id: "b" })],
    });
    expect(commitTxn(1, graph)).toBeUndefined();
  });

  it("commits forward steps since submittedIndex", () => {
    const v = createVertex("v-new", ["Page"], { title: "Hello" });
    const step = insertStep(v);
    const { graph } = graphWithTxn(1, {
      activeUndoIndex: 0,
      submittedIndex: -1,
      originalSubmittedIndex: -1,
      status: "modified",
      steps: [step],
    });

    const result = commitTxn(1, graph);

    expect(result?.txnId).toBe(1);
    expect(result?.transactions).toHaveLength(1);
    expect(result?.transactions[0].insert?.id).toBe("v-new");
    expect(result?.vertexIdMap).toEqual([]);
    expect(result?.edgeIdMap).toEqual([]);
  });

  it("commits revert steps when undoing past submittedIndex", () => {
    const inserted = createVertex("v1", ["Page"], { title: "A" });
    const insert = insertStep(inserted);
    const { graph } = graphWithTxn(1, {
      steps: [insert],
      activeUndoIndex: -1,
      submittedIndex: 0,
      originalSubmittedIndex: 0,
      status: "reverted",
      revertSteps: [],
    });

    const result = commitTxn(1, graph);

    expect(result?.transactions).toHaveLength(1);
    expect(result?.transactions[0].deleteVertex?.id).toBe("v1");
  });

  it("includes stored revertSteps with forward steps", () => {
    const forward = insertStep(createVertex("v2", ["Page"], {}));
    const revertedInsert = insertStep(createVertex("v1", ["Page"], {}));
    const { graph } = graphWithTxn(1, {
      steps: [mockStep({ id: "old" }), forward],
      activeUndoIndex: 1,
      submittedIndex: 0,
      originalSubmittedIndex: 1,
      status: "modified",
      revertSteps: [revertedInsert],
    });

    const result = commitTxn(1, graph);

    expect(result?.transactions?.length).toBeGreaterThanOrEqual(2);
    const hasDelete = result?.transactions.some((t) => t.deleteVertex?.id === "v1");
    const hasInsert = result?.transactions.some((t) => t.insert?.id === "v2");
    expect(hasDelete).toBe(true);
    expect(hasInsert).toBe(true);
  });

  it("merges duplicate merge operations on same entity", () => {
    const vertex = createVertex("v-merge", ["Page"], { a: 1, b: 1 });
    const step1 = {
      id: "v-merge",
      merge: "mergeVertex",
      data: createVertex("v-merge", ["Page"], { a: 2, b: 1 }),
      originalData: vertex,
    };
    const step2 = {
      id: "v-merge",
      merge: "mergeVertex",
      data: createVertex("v-merge", ["Page"], { a: 2, b: 2 }),
      originalData: vertex,
    };
    const { graph } = graphWithTxn(1, {
      steps: [step1, step2],
      activeUndoIndex: 1,
      submittedIndex: -1,
      status: "modified",
    });

    const result = commitTxn(1, graph);
    const mergeSteps = result?.transactions.filter((t) => t.merge);
    expect(mergeSteps).toHaveLength(1);
    expect(mergeSteps?.[0].merge?.P).toEqual({ a: 2, b: 2 });
  });

  it("includes id maps from global store vertices", () => {
    const { graph } = graphWithTxn(1, {
      steps: [insertStep(createVertex("v3", ["Page"], {}))],
      activeUndoIndex: 0,
      submittedIndex: -1,
      status: "modified",
    });
    graph.vertexes.vertexOldIdToNewIdMap.P = { old: "new" };
    graph.vertexes.edgeOldIdToNewIdMap.P = { eOld: "eNew" };

    const result = commitTxn(1, graph);
    expect(result?.vertexIdMap).toEqual([["old", "new"]]);
    expect(result?.edgeIdMap).toEqual([["eOld", "eNew"]]);
  });
});
