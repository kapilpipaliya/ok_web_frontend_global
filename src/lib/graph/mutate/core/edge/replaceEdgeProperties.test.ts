import { describe, it, expect } from "vitest";
import { replaceEdgeProperties } from "~/lib/graph/mutate/core/edge/replaceEdgeProperties";
import {
  createEdge,
  createGraphWithGlobalStore,
  createVertex,
  seedVertex,
} from "~/lib/graph/__tests__/helpers/createTestGraph";

describe("replaceEdgeProperties", () => {
  it("replaces edge properties", () => {
    const { graph, setGraph } = createGraphWithGlobalStore();
    seedVertex(setGraph, createVertex("s", ["Page"]));
    seedVertex(setGraph, createVertex("e", ["Attr"]));
    setGraph((d) => {
      d.edges.e1 = createEdge("e1", "Attr", "s", "e", { a: 1 });
    });

    const result = replaceEdgeProperties(
      0,
      "e1",
      graph,
      setGraph,
      { b: 2 },
      { skipTransactionDetail: true },
    );

    expect(result.error).toBe(false);
    expect(graph.edges.e1?.P).toEqual({ b: 2 });
  });

  it("returns error when edge is missing", () => {
    const { graph, setGraph } = createGraphWithGlobalStore();

    expect(
      replaceEdgeProperties(0, "missing", graph, setGraph, {}, {
        skipTransactionDetail: true,
      }).error,
    ).toBe("Edge ID is not valid");
  });
});
