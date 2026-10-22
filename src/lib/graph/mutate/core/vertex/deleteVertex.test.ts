import { describe, expect, it, vi, beforeEach } from "vitest";
import { deleteVertex } from "./deleteVertex";
import {
  createGraphWithGlobalStore,
  createTxnVertex,
  createVertex,
  seedVertex,
} from "~/lib/graph/__tests__/helpers/createTestGraph";

vi.mock("~/lib/graph/mutate/core/channel/broadcastToAllChannels", () => ({
  broadcastToAllChannels: vi.fn(),
}));

describe("deleteVertex", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("alert", vi.fn());
  });

  it("deletes an isolated vertex and clears label map entry", () => {
    const { graph, setGraph } = createGraphWithGlobalStore({
      extraVertexes: { txn1: createTxnVertex(1) },
    });
    seedVertex(setGraph, createVertex("v1", ["Attr"], { key: "a" }));

    const result = deleteVertex(1, "v1", graph, setGraph, {
      skipTransactionDetail: true,
    });

    expect(result.error).toBe(false);
    expect(graph.vertexes.v1).toBeUndefined();
    expect(graph.vertexLabelIdMap.Attr).toBeUndefined();
  });

  it("errors for missing id", () => {
    const { graph, setGraph } = createGraphWithGlobalStore();
    expect(deleteVertex(0, "missing", graph, setGraph).error).toBe(
      "Vertex ID is not valid",
    );
  });

  it("errors when OUT edges exist", () => {
    const { graph, setGraph } = createGraphWithGlobalStore();
    seedVertex(
      setGraph,
      createVertex("v1", ["Attr"], {}, { OUT: { Attr: ["e1"] } }),
    );

    const result = deleteVertex(0, "v1", graph, setGraph, {
      skipTransactionDetail: true,
    });
    expect(result.error).toBe("Vertex Children Exist When deleting vertex");
    expect(alert).toHaveBeenCalled();
  });
});
