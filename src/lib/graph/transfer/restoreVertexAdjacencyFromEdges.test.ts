import { describe, expect, it } from "vitest";
import { restoreVertexAdjacencyFromEdges } from "./restoreVertexAdjacencyFromEdges";
import {
  createEdge,
  createVertex,
} from "~/lib/graph/__tests__/helpers/createTestGraph";

describe("restoreVertexAdjacencyFromEdges", () => {
  it("rebuilds IN/OUT from edges and resets prior adjacency", () => {
    const graph = {
      vertexes: {
        parent: createVertex("parent", ["Page"], {}, {
          OUT: { Old: ["x"] },
        }),
        child: createVertex("child", ["Attr"], {}, {
          IN: { Old: ["y"] },
        }),
        orphan: createVertex("orphan", ["Attr"]),
      },
      edges: {
        e1: createEdge("e1", "Attr", "parent", "child"),
      },
    };

    restoreVertexAdjacencyFromEdges(graph);

    expect(graph.vertexes.parent.OUT).toEqual({ Attr: ["e1"] });
    expect(graph.vertexes.parent.IN).toEqual({});
    expect(graph.vertexes.child.IN).toEqual({ Attr: ["e1"] });
    expect(graph.vertexes.child.OUT).toEqual({});
    expect(graph.vertexes.orphan.IN).toEqual({});
    expect(graph.vertexes.orphan.OUT).toEqual({});
  });

  it("does not duplicate edge ids and skips missing endpoints", () => {
    const graph = {
      vertexes: {
        a: createVertex("a", ["A"]),
        b: createVertex("b", ["B"]),
      },
      edges: {
        e1: createEdge("e1", "Link", "a", "b"),
        e2: createEdge("e2", "Link", "a", "b"),
        dangling: createEdge("dangling", "Link", "missing", "b"),
      },
    };

    restoreVertexAdjacencyFromEdges(graph);
    restoreVertexAdjacencyFromEdges(graph);

    expect(graph.vertexes.a.OUT.Link).toEqual(["e1", "e2"]);
    expect(graph.vertexes.b.IN.Link).toEqual(["e1", "e2", "dangling"]);
  });
});
