import { describe, expect, it } from "vitest";
import { getActiveUndoIndex } from "./getActiveUndoIndex";
import {
  createGraphWithGlobalStore,
  createTxnVertex,
} from "~/lib/graph/__tests__/helpers/createTestGraph";

describe("getActiveUndoIndex", () => {
  it("reads activeUndoIndex or -1", () => {
    const { graph } = createGraphWithGlobalStore({
      extraVertexes: {
        txn1: createTxnVertex(1, { activeUndoIndex: 4 }),
      },
    });
    expect(getActiveUndoIndex(1, graph)).toBe(4);
    expect(getActiveUndoIndex(99, graph)).toBe(-1);
  });
});
