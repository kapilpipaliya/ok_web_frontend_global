import { describe, expect, it } from "vitest";
import { getDefaultTxnValue } from "./getDefaultTxnValue";
import { getExistingOrDefaultTxnValue } from "./getExistingOrDefaultTxnValue";
import { getLastTxnIndex } from "./getLastTxnIndex";
import { getNamedIndex } from "./getNamedIndex";
import { isDisabledTxn } from "./isDisabledTxn";
import {
  createGraphWithGlobalStore,
  createTxnVertex,
} from "~/lib/graph/__tests__/helpers/createTestGraph";

describe("transaction value helpers", () => {
  it("getDefaultTxnValue returns empty history indexes", () => {
    expect(getDefaultTxnValue()).toMatchObject({
      activeUndoIndex: -1,
      submittedIndex: -1,
      steps: [],
      revertSteps: [],
    });
  });

  it("getExistingOrDefaultTxnValue clones existing txn or defaults", () => {
    const { graph } = createGraphWithGlobalStore({
      extraVertexes: {
        txn2: createTxnVertex(2, {
          activeUndoIndex: 1,
          steps: [{ id: "s0" } as never, { id: "s1" } as never],
          status: "modified",
        }),
      },
    });
    expect(getExistingOrDefaultTxnValue(0, graph).activeUndoIndex).toBe(-1);
    const existing = getExistingOrDefaultTxnValue(2, graph);
    expect(existing.activeUndoIndex).toBe(1);
    expect(existing.steps).toHaveLength(2);
    existing.steps.pop();
    expect(graph.vertexes.txn2.P.steps).toHaveLength(2);
  });

  it("getLastTxnIndex / getNamedIndex / isDisabledTxn", () => {
    const { graph } = createGraphWithGlobalStore({
      extraVertexes: {
        txn3: createTxnVertex(3, {
          steps: [{ id: "a" } as never, { id: "b" } as never],
          namedUndoStepIndexes: { save: 1 },
          activeUndoIndex: 1,
          submittedIndex: 1,
          originalSubmittedIndex: 1,
          status: "committed",
          revertSteps: [],
        }),
        txn4: createTxnVertex(4, {
          status: "error",
        }),
        txn5: createTxnVertex(5, {
          activeUndoIndex: 0,
          submittedIndex: -1,
          originalSubmittedIndex: -1,
          status: "modified",
          steps: [{ id: "x" } as never],
        }),
      },
    });

    expect(getLastTxnIndex(3, graph)).toBe(1);
    expect(getLastTxnIndex(99, graph)).toBe(-1);
    expect(getNamedIndex(3, "save", graph)).toBe(1);
    expect(getNamedIndex(0, "save", graph)).toBeUndefined();
    expect(isDisabledTxn(0, graph)).toBe(true);
    expect(isDisabledTxn(4, graph)).toBe(true);
    expect(isDisabledTxn(3, graph)).toBe(true);
    expect(isDisabledTxn(5, graph)).toBe(false);
  });
});
