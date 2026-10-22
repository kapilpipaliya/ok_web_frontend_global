import { describe, it, expect } from "vitest";
import { setGraphDataWithTransaction } from "~/lib/graph/mutate/core/setGraphDataWithTransaction";
import {
  createGraphWithGlobalStore,
  createTxnVertex,
  createVertex,
  seedVertex,
} from "~/lib/graph/__tests__/helpers/createTestGraph";

describe("setGraphDataWithTransaction", () => {
  it("inserts new vertex via transaction path with skipTransactionDetail", () => {
    const { graph, setGraph } = createGraphWithGlobalStore({ txnId_: 1 });
    seedVertex(setGraph, createTxnVertex(1));

    const vertex = createVertex("v-new", ["User"], { name: "Txn" });
    const result = setGraphDataWithTransaction(
      1,
      graph,
      setGraph,
      { vertexes: { "v-new": vertex }, edges: {} },
      { skipTransactionDetail: true },
    );

    expect(result.error).toBe(false);
    expect(graph.vertexes["v-new"]?.P.name).toBe("Txn");
  });
});
