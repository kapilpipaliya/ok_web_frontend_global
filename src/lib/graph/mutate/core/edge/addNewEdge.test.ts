import { describe, expect, it, vi, beforeEach } from "vitest";
import { addNewEdge } from "./addNewEdge";
import { newEdge } from "./newEdge";
import {
  createGraphWithGlobalStore,
  createTxnVertex,
  createVertex,
  seedVertex,
} from "~/lib/graph/__tests__/helpers/createTestGraph";

vi.mock("~/lib/graph/mutate/core/channel/broadcastToAllChannels", () => ({
  broadcastToAllChannels: vi.fn(),
}));

describe("addNewEdge", () => {
  beforeEach(() => vi.clearAllMocks());

  it("links start OUT and end IN", () => {
    const { graph, setGraph } = createGraphWithGlobalStore({
      extraVertexes: { txn1: createTxnVertex(1) },
    });
    seedVertex(setGraph, createVertex("a", ["Page"]));
    seedVertex(setGraph, createVertex("b", ["Attr"]));

    const result = addNewEdge(
      1,
      newEdge("e1", "Attr", {}, "a", "b"),
      graph,
      setGraph,
      { skipTransactionDetail: true },
    );

    expect(result.error).toBe(false);
    expect(graph.edges.e1).toMatchObject({ S: "a", E: "b", T: "Attr" });
    expect(graph.vertexes.a.OUT.Attr).toEqual(["e1"]);
    expect(graph.vertexes.b.IN.Attr).toEqual(["e1"]);
  });

  it("errors when endpoints missing", () => {
    const { graph, setGraph } = createGraphWithGlobalStore();
    seedVertex(setGraph, createVertex("a", ["Page"]));

    expect(
      addNewEdge(0, newEdge("e1", "Attr", {}, "a", "missing"), graph, setGraph, {
        skipTransactionDetail: true,
      }).error,
    ).toBe("Edge End Vertex not exist while adding new edge");
  });

  it("errors on duplicate edge id", () => {
    const { graph, setGraph } = createGraphWithGlobalStore({
      extraEdges: { e1: newEdge("e1", "Attr", {}, "a", "b") },
    });
    seedVertex(setGraph, createVertex("a", ["Page"]));
    seedVertex(setGraph, createVertex("b", ["Attr"]));

    expect(
      addNewEdge(0, newEdge("e1", "Attr", {}, "a", "b"), graph, setGraph, {
        skipTransactionDetail: true,
      }).error,
    ).toBe("Edge ID already exist while adding new edge");
  });
});
