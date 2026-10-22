import { describe, it, expect } from "vitest";
import { replaceVertexProperties } from "~/lib/graph/mutate/core/vertex/replaceVertexProperties";
import {
  createGraphWithGlobalStore,
  createVertex,
  seedVertex,
} from "~/lib/graph/__tests__/helpers/createTestGraph";

describe("replaceVertexProperties", () => {
  it("replaces all properties on the vertex", () => {
    const { graph, setGraph } = createGraphWithGlobalStore();
    seedVertex(
      setGraph,
      createVertex("v1", ["User"], { name: "Ada", role: "admin" }),
    );

    const result = replaceVertexProperties(
      0,
      "v1",
      graph,
      setGraph,
      { name: "Grace" },
      { skipTransactionDetail: true },
    );

    expect(result.error).toBe(false);
    expect(graph.vertexes.v1?.P).toEqual({ name: "Grace" });
  });

  it("returns error when vertex is missing", () => {
    const { graph, setGraph } = createGraphWithGlobalStore();

    expect(
      replaceVertexProperties(0, "missing", graph, setGraph, {}, {
        skipTransactionDetail: true,
      }).error,
    ).toContain("Vertex ID not exist");
  });
});
