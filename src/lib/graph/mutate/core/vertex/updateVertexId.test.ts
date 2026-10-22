import { describe, it, expect } from "vitest";
import { updateVertexId } from "~/lib/graph/mutate/core/vertex/updateVertexId";
import {
  createEdge,
  createGraphWithGlobalStore,
  createVertex,
  seedVertex,
} from "~/lib/graph/__tests__/helpers/createTestGraph";

describe("updateVertexId", () => {
  it("renames vertex and updates label map and connected edges", () => {
    const { graph, setGraph } = createGraphWithGlobalStore();
    const start = createVertex("oldId", ["Page"], { title: "A" });
    const end = createVertex("end", ["Attr"]);
    seedVertex(setGraph, start);
    seedVertex(setGraph, end);

    const edge = createEdge("e1", "Attr", "oldId", "end");
    setGraph("edges", "e1", edge);
    setGraph("vertexes", "oldId", "OUT", "Attr", ["e1"]);
    setGraph("vertexes", "end", "IN", "Attr", ["e1"]);

    const result = updateVertexId("oldId", "newId", graph, setGraph, {
      skipTransactionDetail: true,
    });

    expect(result.error).toBe("");
    expect(graph.vertexes.oldId).toBeUndefined();
    expect(graph.vertexes.newId?.id).toBe("newId");
    expect(graph.vertexes.newId?.P.title).toBe("A");
    expect(graph.vertexLabelIdMap.Page).toEqual(["newId"]);
    expect(graph.edges.e1?.S).toBe("newId");
    expect(graph.vertexes.end?.IN.Attr).toEqual(["e1"]);
  });

  it("returns error when old id missing or new id taken", () => {
    const { graph, setGraph } = createGraphWithGlobalStore();
    seedVertex(setGraph, createVertex("exists", ["Page"]));

    expect(updateVertexId("missing", "newId", graph, setGraph).error).toBe(
      "Vertex ID is not valid",
    );
    expect(updateVertexId("exists", "exists", graph, setGraph).error).toBe(
      "new Vertex ID is not valid",
    );
  });
});
