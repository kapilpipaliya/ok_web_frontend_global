import { describe, expect, it } from "vitest";
import {
  compactAttrCodeStrings,
  mergeGraphs,
  prepareGraphForWireTransfer,
  stripDesignerAttrProperties,
  stripGraphTimestamps,
} from "./graphFetchUtils";
import {
  createEdge,
  createVertex,
} from "~/lib/graph/__tests__/helpers/createTestGraph";

describe("graphFetchUtils", () => {
  it("stripGraphTimestamps keeps Page updatedAt and strips others", () => {
    const graph = {
      vertexes: {
        page: createVertex("page", ["Page"], {
          createdAt: "c",
          updatedAt: "u",
        }),
        attr: createVertex("attr", ["Attr"], {
          createdAt: "c",
          updatedAt: "u",
        }),
      },
      edges: {
        e1: createEdge("e1", "Attr", "page", "attr", {
          createdAt: "c",
          updatedAt: "u",
        }),
      },
    };

    stripGraphTimestamps(graph);
    expect(graph.vertexes.page.P.createdAt).toBeUndefined();
    expect(graph.vertexes.page.P.updatedAt).toBe("u");
    expect(graph.vertexes.attr.P.updatedAt).toBeUndefined();
    expect(graph.edges.e1.P).toBeUndefined();
  });

  it("stripDesignerAttrProperties removes layerName on Attr", () => {
    const graph = {
      vertexes: {
        a: createVertex("a", ["Attr"], { layerName: "L1", props: "x" }),
        p: createVertex("p", ["Page"], { layerName: "keep" }),
      },
      edges: {},
    };
    stripDesignerAttrProperties(graph);
    expect(graph.vertexes.a.P.layerName).toBeUndefined();
    expect(graph.vertexes.p.P.layerName).toBe("keep");
  });

  it("compactAttrCodeStrings trims trailing spaces and blank lines", () => {
    const graph = {
      vertexes: {
        a: createVertex("a", ["Attr"], {
          props: "return {\n  a: 1  \n\n\n}",
          css: "._id {\n  color: red  \n}",
        }),
      },
      edges: {},
    };
    compactAttrCodeStrings(graph);
    expect(graph.vertexes.a.P.props).toBe("return {\n  a: 1\n\n}");
    expect(graph.vertexes.a.P.css).toBe("._id {\n  color: red\n}");
  });

  it("prepareGraphForWireTransfer strips adjacency and designer fields", () => {
    const graph = {
      vertexes: {
        a: createVertex(
          "a",
          ["Attr"],
          { layerName: "x", createdAt: "c" },
          { OUT: { Attr: ["e"] } },
        ),
      },
      edges: {},
    };
    prepareGraphForWireTransfer(graph);
    expect(graph.vertexes.a.OUT).toBeUndefined();
    expect(graph.vertexes.a.P.layerName).toBeUndefined();

    const designGraph = {
      vertexes: {
        a: createVertex("a", ["Attr"], { layerName: "keep" }),
      },
      edges: {},
    };
    prepareGraphForWireTransfer(designGraph, { isDesignMode: true });
    expect(designGraph.vertexes.a.P.layerName).toBe("keep");
  });

  it("mergeGraphs merges multiple results", () => {
    expect(mergeGraphs([])).toBeUndefined();
    const one = mergeGraphs([
      {
        graph: {
          vertexes: { a: createVertex("a", ["A"]) },
          edges: {},
        },
      },
    ]);
    expect(one?.graph?.vertexes.a.id).toBe("a");

    const merged = mergeGraphs([
      {
        graph: {
          vertexes: { a: createVertex("a", ["A"]) },
          edges: { e1: createEdge("e1", "T", "a", "b") },
        },
      },
      {
        graph: {
          vertexes: { b: createVertex("b", ["B"]) },
          edges: {},
        },
      },
    ]);
    expect(Object.keys(merged!.graph!.vertexes).sort()).toEqual(["a", "b"]);
    expect(merged!.graph!.edges.e1.id).toBe("e1");
  });
});
