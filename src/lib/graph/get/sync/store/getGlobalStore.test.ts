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
    setGraph((d) => {
      Object.assign(d.vertexes.vertexOldIdToNewIdMap.P, { a: "b" });
      Object.assign(d.vertexes.edgeOldIdToNewIdMap.P, { e: "f" });
    });

    expect(getGlobalStore(graph).P.txnId_).toBe(7);
    expect(getVertexOldIdToNewIdMap(graph)).toEqual({ a: "b" });
    expect(getEdgeOldIdToNewIdMap(graph)).toEqual({ e: "f" });
  });

  it("returns empty objects when maps missing", () => {
    const { graph, setGraph } = createGraphWithGlobalStore();
    setGraph((d) => {
      delete d.vertexes.vertexOldIdToNewIdMap;
      delete d.vertexes.edgeOldIdToNewIdMap;
      delete d.vertexes.globalStoreId;
    });
    expect(getVertexOldIdToNewIdMap(graph)).toEqual({});
    expect(getEdgeOldIdToNewIdMap(graph)).toEqual({});
    expect(getGlobalStore(graph).P).toEqual({});
  });
});
