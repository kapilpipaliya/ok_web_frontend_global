import { describe, expect, it, vi, beforeEach } from "vitest";
import { deleteEdge } from "./deleteEdge";
import { newEdge } from "./newEdge";
import {
  createGraphWithGlobalStore,
  createVertex,
  seedVertex,
} from "~/lib/graph/__tests__/helpers/createTestGraph";
import { addNewEdge } from "./addNewEdge";

vi.mock("~/lib/graph/mutate/core/channel/broadcastToAllChannels", () => ({
  broadcastToAllChannels: vi.fn(),
}));

describe("deleteEdge", () => {
  beforeEach(() => vi.clearAllMocks());

  it("removes edge and cleans adjacency", () => {
    const { graph, setGraph } = createGraphWithGlobalStore();
    seedVertex(setGraph, createVertex("a", ["Page"]));
    seedVertex(setGraph, createVertex("b", ["Attr"]));
    addNewEdge(0, newEdge("e1", "Attr", {}, "a", "b"), graph, setGraph, {
      skipTransactionDetail: true,
    });

    const result = deleteEdge(0, "e1", graph, setGraph, {
      skipTransactionDetail: true,
    });

    expect(result.error).toBe(false);
    expect(graph.edges.e1).toBeUndefined();
    expect(graph.vertexes.a.OUT.Attr).toBeUndefined();
    expect(graph.vertexes.b.IN.Attr).toBeUndefined();
  });

  it("errors for missing edge", () => {
    const { graph, setGraph } = createGraphWithGlobalStore();
    expect(deleteEdge(0, "missing", graph, setGraph).error).toBe(
      "Edge ID is not valid",
    );
  });
});
