import { describe, it, expect } from "vitest";
import { getProfileImageUrl } from "~/lib/graph/get/sync/user/getProfileImageUrl";
import {
  createGraphWithGlobalStore,
  createVertex,
  createEdge,
  seedVertex,
} from "~/lib/graph/__tests__/helpers/createTestGraph";
import { addNewEdge } from "~/lib/graph/mutate/core/edge/addNewEdge";
import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex/mergeVertexProperties";
import { profileImage } from "~/pages/settings/constants";
import { API } from "~/lib/api/endpoints";

describe("getProfileImageUrl", () => {
  it("returns profile download url when linked file exists", () => {
    const { graph, setGraph } = createGraphWithGlobalStore();
    const user = createVertex("user1", ["User"], {});
    const file = createVertex("f1", ["File"], { fileName: "me.jpg" });
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
    expect(getProfileImageUrl(graph)).toBe(`${API.file.downloadFileUrl}/me.jpg`);
  });

  it("falls back to default profile image constant", () => {
    const { graph } = createGraphWithGlobalStore();
    expect(getProfileImageUrl(graph)).toBe(profileImage);
  });
});
