import { describe, it, expect } from "vitest";
import { deleteTxnId } from "./deleteTxnId";
import { graphWithTxn } from "../__tests__/fixtures";

describe("deleteTxnId", () => {
  it("no-ops for falsy txnId or missing vertex", () => {
    const { graph, setGraph } = graphWithTxn(1);
    deleteTxnId(0, graph, setGraph);
    expect(graph.vertexes.txn1).toBeDefined();
    deleteTxnId(99, graph, setGraph);
    expect(graph.vertexes.txn1).toBeDefined();
  });

  it("removes txn vertex from graph", () => {
    const { graph, setGraph } = graphWithTxn(1);
    deleteTxnId(1, graph, setGraph);
    expect(graph.vertexes.txn1).toBeUndefined();
  });
});
