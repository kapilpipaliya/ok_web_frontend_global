import { describe, expect, it } from "vitest";
import { updateVertexIdsToNew } from "./updateVertexIdsToNew";
import {
  createGraphWithGlobalStore,
  createVertex,
} from "~/lib/graph/__tests__/helpers/createTestGraph";

describe("updateVertexIdsToNew", () => {
  it("remaps vertex id and optionally edge ids", () => {
    const { graph, setGraph } = createGraphWithGlobalStore();
    setGraph((d) => {
      Object.assign(d.vertexes.vertexOldIdToNewIdMap.P, { oldV: "newV" });
      Object.assign(d.vertexes.edgeOldIdToNewIdMap.P, { oldE: "newE" });
    });

    const vertex = createVertex(
      "oldV",
      ["Attr"],
      {},
      { IN: { Attr: ["oldE"] }, OUT: { Attr: ["oldE"] } },
    );

    const remapped = updateVertexIdsToNew(vertex, graph, false);
    expect(remapped.id).toBe("newV");
    expect(remapped.IN.Attr).toEqual(["newE"]);
    expect(remapped.OUT.Attr).toEqual(["newE"]);
  });

  it("skips edge remapping when ignoreEdges is true", () => {
    const { graph, setGraph } = createGraphWithGlobalStore();
    setGraph((d) => {
      Object.assign(d.vertexes.vertexOldIdToNewIdMap.P, { oldV: "newV" });
      Object.assign(d.vertexes.edgeOldIdToNewIdMap.P, { oldE: "newE" });
    });

    const vertex = createVertex(
      "oldV",
      ["Attr"],
      {},
      { OUT: { Attr: ["oldE"] } },
    );
    updateVertexIdsToNew(vertex, graph, true);
    expect(vertex.id).toBe("newV");
    expect(vertex.OUT.Attr).toEqual(["oldE"]);
  });
});
