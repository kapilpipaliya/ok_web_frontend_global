import { describe, expect, it } from "vitest";
import { stripVertexAdjacency } from "./stripVertexAdjacency";
import { createVertex } from "~/lib/graph/__tests__/helpers/createTestGraph";

describe("stripVertexAdjacency", () => {
  it("no-ops on undefined / missing vertexes", () => {
    expect(() => stripVertexAdjacency(undefined)).not.toThrow();
    expect(() => stripVertexAdjacency({} as never)).not.toThrow();
  });

  it("deletes IN and OUT from every vertex", () => {
    const graph = {
      vertexes: {
        a: createVertex("a", ["Attr"], {}, {
          IN: { Attr: ["e1"] },
          OUT: { Attr: ["e2"] },
        }),
        b: createVertex("b", ["Page"], { key: "Home" }),
      },
      edges: {},
    };

    stripVertexAdjacency(graph);

    expect(graph.vertexes.a.IN).toBeUndefined();
    expect(graph.vertexes.a.OUT).toBeUndefined();
    expect(graph.vertexes.b.IN).toBeUndefined();
    expect(graph.vertexes.b.OUT).toBeUndefined();
    expect(graph.vertexes.a.P).toEqual({});
    expect(graph.vertexes.b.P).toEqual({ key: "Home" });
  });
});
