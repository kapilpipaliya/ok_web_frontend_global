import { describe, expect, it, vi, beforeEach } from "vitest";
import { addNewVertex } from "./addNewVertex";
import { newVertex } from "./newVertex";
import {
  createGraphWithGlobalStore,
  createTxnVertex,
} from "~/lib/graph/__tests__/helpers/createTestGraph";

vi.mock("~/lib/graph/mutate/core/channel/broadcastToAllChannels", () => ({
  broadcastToAllChannels: vi.fn(),
}));

describe("addNewVertex", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("adds a vertex and updates label map", () => {
    const { graph, setGraph } = createGraphWithGlobalStore({
      extraVertexes: { txn1: createTxnVertex(1) },
    });
    const vertex = newVertex("v1", ["Attr"], { key: "x" });

    const result = addNewVertex(1, vertex, graph, setGraph, {
      skipTransactionDetail: true,
    });

    expect(result.error).toBe("");
    expect(graph.vertexes.v1).toMatchObject({
      id: "v1",
      L: ["Attr"],
      P: { key: "x" },
    });
    expect(graph.vertexLabelIdMap.Attr).toEqual(["v1"]);
  });

  it("errors when vertex id already exists", () => {
    const existing = newVertex("v1", ["Attr"]);
    const { graph, setGraph } = createGraphWithGlobalStore({
      extraVertexes: {
        txn1: createTxnVertex(1),
        v1: existing,
      },
    });

    const result = addNewVertex(1, newVertex("v1", ["Attr"]), graph, setGraph, {
      skipTransactionDetail: true,
    });
    expect(result.error).toBe("Vertex ID Already exist");
  });
});
