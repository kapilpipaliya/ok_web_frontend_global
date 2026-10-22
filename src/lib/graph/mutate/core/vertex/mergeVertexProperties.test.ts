import { describe, expect, it, vi, beforeEach } from "vitest";
import { mergeVertexProperties } from "./mergeVertexProperties";
import {
  createGraphWithGlobalStore,
  createVertex,
  seedVertex,
} from "~/lib/graph/__tests__/helpers/createTestGraph";

vi.mock("~/lib/graph/mutate/core/channel/broadcastToAllChannels", () => ({
  broadcastToAllChannels: vi.fn(),
}));

describe("mergeVertexProperties", () => {
  beforeEach(() => vi.clearAllMocks());

  it("merges top-level properties", () => {
    const { graph, setGraph } = createGraphWithGlobalStore();
    seedVertex(setGraph, createVertex("v1", ["Attr"], { a: 1, b: 2 }));

    const result = mergeVertexProperties(
      0,
      "v1",
      graph,
      setGraph,
      { b: 9, c: 3 },
      { skipTransactionDetail: true },
    );

    expect(result.error).toBe("");
    expect(graph.vertexes.v1.P).toEqual({ a: 1, b: 9, c: 3 });
  });

  it("errors for missing vertex", () => {
    const { graph, setGraph } = createGraphWithGlobalStore();
    expect(
      mergeVertexProperties(0, "missing", graph, setGraph, { a: 1 }).error,
    ).toContain("Vertex ID is not valid");
  });
});
