import { describe, it, expect } from "vitest";
import { cloneVertexWithEdges } from "~/lib/graph/get/sync/entity/cloneVertexWithEdges";
import {
  createGraphWithGlobalStore,
  createVertex,
  createEdge,
  seedVertex,
} from "~/lib/graph/__tests__/helpers/createTestGraph";
import { addNewEdge } from "~/lib/graph/mutate/core/edge/addNewEdge";

describe("cloneVertexWithEdges", () => {
  it("clones vertex properties and recreates OUT edges to same targets", () => {
    const { graph, setGraph } = createGraphWithGlobalStore({ newVertexId_: 10 });
    const source = createVertex("src", ["Attr"], { key: "field", displayOrder: 1 });
    const target = createVertex("tgt", ["User"], { uuid: "u1" });
    seedVertex(setGraph, source);
    seedVertex(setGraph, target);
    addNewEdge(
      0,
      createEdge("e-out", "UserField", "src", "tgt"),
      graph,
      setGraph,
    );

    const clone = cloneVertexWithEdges(
      0,
      graph.vertexes.src,
      { key: "field-copy" },
      graph,
      setGraph,
    );

    expect(clone.id).not.toBe("src");
    expect(clone.P.key).toBe("field-copy");
    expect(clone.L).toEqual(["Attr"]);

    const outTypes = Object.keys(clone.OUT);
    expect(outTypes).toContain("UserField");
    const newEdgeId = clone.OUT.UserField[0];
    const newEdge = graph.edges[newEdgeId];
    expect(newEdge.S).toBe(clone.id);
    expect(newEdge.E).toBe("tgt");
  });
});
