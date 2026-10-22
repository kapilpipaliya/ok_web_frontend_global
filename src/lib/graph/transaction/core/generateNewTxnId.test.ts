import { describe, expect, it, vi } from "vitest";
import { generateNewTxnId } from "./generateNewTxnId";
import { createGraphWithGlobalStore } from "~/lib/graph/__tests__/helpers/createTestGraph";

vi.mock("~/lib/graph/mutate/core/channel/broadcastToAllChannels", () => ({
  broadcastToAllChannels: vi.fn(),
}));

describe("generateNewTxnId", () => {
  it("allocates next txn id and creates Transaction vertex", () => {
    const { graph, setGraph } = createGraphWithGlobalStore({ txnId_: 2 });
    const id = generateNewTxnId(graph, setGraph);
    expect(id).toBe(3);
    expect(graph.vertexes.globalStoreId.P.txnId_).toBe(3);
    expect(graph.vertexes.txn3.L).toContain("Transaction");
    expect(graph.vertexes.txn3.P.steps).toEqual([]);
  });
});
