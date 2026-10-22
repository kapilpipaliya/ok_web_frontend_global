import { describe, expect, it } from "vitest";
import {
  getEdgeOldIdToNewIdMap,
  getGlobalStore,
  getVertexOldIdToNewIdMap,
} from "./getGlobalStore";
import { createGraphWithGlobalStore } from "~/lib/graph/__tests__/helpers/createTestGraph";

describe("getGlobalStore helpers", () => {
  it("reads global store and id maps", () => {
    const { graph, setGraph } = createGraphWithGlobalStore({ txnId_: 7 });
    setGraph("vertexes", "vertexOldIdToNewIdMap", "P", { a: "b" });
    setGraph("vertexes", "edgeOldIdToNewIdMap", "P", { e: "f" });

    expect(getGlobalStore(graph).P.txnId_).toBe(7);
    expect(getVertexOldIdToNewIdMap(graph)).toEqual({ a: "b" });
    expect(getEdgeOldIdToNewIdMap(graph)).toEqual({ e: "f" });
  });

  it("returns empty objects when maps missing", () => {
    const { graph, setGraph } = createGraphWithGlobalStore();
    setGraph("vertexes", "vertexOldIdToNewIdMap", undefined as never);
    setGraph("vertexes", "edgeOldIdToNewIdMap", undefined as never);
    setGraph("vertexes", "globalStoreId", undefined as never);
    expect(getVertexOldIdToNewIdMap(graph)).toEqual({});
    expect(getEdgeOldIdToNewIdMap(graph)).toEqual({});
    expect(getGlobalStore(graph).P).toEqual({});
  });
});
