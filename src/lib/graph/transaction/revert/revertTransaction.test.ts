import { describe, it, expect, vi, beforeEach } from "vitest";
import { revertTransaction } from "./revertTransaction";
import { graphWithTxn, mockStep } from "../__tests__/fixtures";

describe("revertTransaction", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("no-ops for falsy txnId or missing vertex", () => {
    const { graph, setGraph } = graphWithTxn(1);
    revertTransaction(0, graph, setGraph);
    expect(graph.vertexes.txn1).toBeDefined();
    revertTransaction(99, graph, setGraph);
    expect(graph.vertexes.txn1).toBeDefined();
  });

  it("clears history and deletes txn vertex", () => {
    const { graph, setGraph } = graphWithTxn(1, {
      steps: [mockStep({ id: "a" })],
      activeUndoIndex: 0,
    });

    revertTransaction(1, graph, setGraph);

    expect(graph.vertexes.txn1).toBeUndefined();
  });
});
