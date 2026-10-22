import { describe, it, expect } from "vitest";
import { getDefaultTxnValue } from "./getDefaultTxnValue";

describe("getDefaultTxnValue", () => {
  it("returns empty transaction baseline", () => {
    expect(getDefaultTxnValue()).toEqual({
      activeUndoIndex: -1,
      namedUndoStepIndexes: {},
      originalSubmittedIndex: -1,
      preventUndoBeforeIndex: -1,
      revertSteps: [],
      steps: [],
      submittedIndex: -1,
      undoStepIndexes: [],
    });
  });
});
