import { describe, expect, it, vi } from "vitest";
import { newRow } from "./addNewRow";
import {
  createGraphWithGlobalStore,
  createVertex,
  seedVertex,
} from "~/lib/graph/__tests__/helpers/createTestGraph";

vi.mock("~/lib/graph/mutate/core/channel/broadcastToAllChannels", () => ({
  broadcastToAllChannels: vi.fn(),
}));

describe("newRow", () => {
  it("creates child vertex and outward edge", () => {
    const { graph, setGraph } = createGraphWithGlobalStore({
      newVertexId_: 0,
    });
    seedVertex(setGraph, createVertex("parent", ["Page"]));

    const result = newRow(
      graph,
      setGraph,
      0,
      graph.vertexes.parent,
      "Attr",
      "PageAttr",
      { key: "title", displayOrder: 1 },
      false,
    );

    expect(result.error).toBe(false);
    expect(result.vertexId).toBe("1");
    expect(result.edgeId).toBeDefined();
    expect(graph.vertexes["1"].L).toEqual(["Attr"]);
    expect(graph.vertexes.parent.OUT.PageAttr).toContain(result.edgeId);
  });

  it("creates inward edge from child to parent", () => {
    const { graph, setGraph } = createGraphWithGlobalStore({
      newVertexId_: 0,
    });
    seedVertex(setGraph, createVertex("parent", ["Page"]));

    const result = newRow(
      graph,
      setGraph,
      0,
      graph.vertexes.parent,
      "Attr",
      "PageAttr",
      { key: "child" },
      true,
    );

    expect(result.error).toBe(false);
    expect(graph.vertexes["1"].OUT.PageAttr).toContain(result.edgeId);
    expect(graph.vertexes.parent.IN.PageAttr).toContain(result.edgeId);
  });
});
