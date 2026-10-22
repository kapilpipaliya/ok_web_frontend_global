import { describe, expect, it } from "vitest";
import { txnHasSteps } from "./txnHasSteps";
import {
  createGraphWithGlobalStore,
  createTxnVertex,
} from "~/lib/graph/__tests__/helpers/createTestGraph";

describe("txnHasSteps", () => {
  it("returns false for missing/empty and true when steps exist", () => {
    const { graph } = createGraphWithGlobalStore({
      extraVertexes: {
        txn1: createTxnVertex(1, { steps: [] }),
        txn2: createTxnVertex(2, { steps: [{ id: "s" } as never] }),
      },
    });
    expect(txnHasSteps(0, graph)).toBe(false);
    expect(txnHasSteps(1, graph)).toBe(false);
    expect(txnHasSteps(2, graph)).toBe(true);
  });
});
