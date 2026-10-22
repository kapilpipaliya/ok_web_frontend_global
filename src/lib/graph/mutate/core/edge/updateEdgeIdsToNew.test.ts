import { describe, expect, it } from "vitest";
import { updateEdgeIdsToNew } from "./updateEdgeIdsToNew";
import { newEdge } from "./newEdge";
import { createGraphWithGlobalStore } from "~/lib/graph/__tests__/helpers/createTestGraph";

describe("updateEdgeIdsToNew", () => {
  it("returns a cloned edge with remapped ids", () => {
    const { graph, setGraph } = createGraphWithGlobalStore();
    setGraph("vertexes", "edgeOldIdToNewIdMap", "P", { oldE: "newE" });
    setGraph("vertexes", "vertexOldIdToNewIdMap", "P", {
      oldS: "newS",
      oldEpt: "newEpt",
    });

    const original = newEdge("oldE", "Attr", { x: 1 }, "oldS", "oldEpt");
    const remapped = updateEdgeIdsToNew(original, graph);

    expect(remapped).toEqual({
      id: "newE",
      T: "Attr",
      P: { x: 1 },
      S: "newS",
      E: "newEpt",
    });
    expect(original.id).toBe("oldE");
  });
});
