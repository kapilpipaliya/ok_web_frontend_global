import { describe, it, expect } from "vitest";
import { updateEdgeId } from "~/lib/graph/mutate/core/edge/updateEdgeId";
import {
  createEdge,
  createGraphWithGlobalStore,
  createVertex,
  seedVertex,
} from "~/lib/graph/__tests__/helpers/createTestGraph";

describe("updateEdgeId", () => {
  it("renames edge and updates vertex adjacency lists", () => {
    const { graph, setGraph } = createGraphWithGlobalStore();
    seedVertex(setGraph, createVertex("s", ["Page"]));
    seedVertex(setGraph, createVertex("e", ["Attr"]));

    const edge = createEdge("oldEdge", "Attr", "s", "e");
    setGraph((d) => {
      d.edges.oldEdge = edge;
      d.vertexes.s.OUT.Attr = ["oldEdge"];
      d.vertexes.e.IN.Attr = ["oldEdge"];
    });

    const result = updateEdgeId("oldEdge", "newEdge", graph, setGraph, {
      skipTransactionDetail: true,
    });

    expect(result.error).toBe("");
    expect(graph.edges.oldEdge).toBeUndefined();
    expect(graph.edges.newEdge?.id).toBe("newEdge");
    expect(graph.vertexes.s?.OUT.Attr).toEqual(["newEdge"]);
    expect(graph.vertexes.e?.IN.Attr).toEqual(["newEdge"]);
  });

  it("returns error when old edge missing or new id exists", () => {
    const { graph, setGraph } = createGraphWithGlobalStore();
    setGraph((d) => {
      d.edges.e1 = createEdge("e1", "Attr", "a", "b");
    });

    expect(updateEdgeId("missing", "newE", graph, setGraph).error).toBe(
      "ID is not valid",
    );
    expect(updateEdgeId("e1", "e1", graph, setGraph).error).toBe(
      "new Edge ID is not valid",
    );
  });
});
