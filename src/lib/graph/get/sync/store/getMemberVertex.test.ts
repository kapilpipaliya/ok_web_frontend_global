import { describe, it, expect } from "vitest";
import {
  getMemberVertex,
  getProfileImageVertex,
} from "~/lib/graph/get/sync/store/getMemberVertex";
import {
  createGraphWithGlobalStore,
  createVertex,
  createEdge,
  seedVertex,
} from "~/lib/graph/__tests__/helpers/createTestGraph";
import { addNewEdge } from "~/lib/graph/mutate/core/edge/addNewEdge";
import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex/mergeVertexProperties";

describe("getMemberVertex", () => {
  it("returns user vertex referenced by global store userId", () => {
    const { graph, setGraph } = createGraphWithGlobalStore();
    const user = createVertex("user1", ["User"], { uuid: "u1" });
    seedVertex(setGraph, user);
    mergeVertexProperties(0, "globalStoreId", graph, setGraph, {
      userId: "user1",
    });
    expect(getMemberVertex(graph)?.id).toBe("user1");
  });

  it("returns null when userId is missing or vertex not in graph", () => {
    const { graph } = createGraphWithGlobalStore();
    expect(getMemberVertex(graph)).toBeNull();
  });
});

describe("getProfileImageVertex", () => {
  it("returns file vertex linked via UserProfileImage", () => {
    const { graph, setGraph } = createGraphWithGlobalStore();
    const user = createVertex("user1", ["User"], {});
    const file = createVertex("f1", ["File"], { fileName: "pic.png" });
    seedVertex(setGraph, user);
    seedVertex(setGraph, file);
    mergeVertexProperties(0, "globalStoreId", graph, setGraph, {
      userId: "user1",
    });
    addNewEdge(
      0,
      createEdge("e1", "UserProfileImage", "user1", "f1"),
      graph,
      setGraph,
    );

    expect(getProfileImageVertex(graph)?.id).toBe("f1");
  });
});
