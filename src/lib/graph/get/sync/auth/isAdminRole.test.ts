import { describe, it, expect } from "vitest";
import { isAdminRole } from "~/lib/graph/get/sync/auth/isAdminRole";
import {
  createGraphWithGlobalStore,
  createVertex,
  seedVertex,
} from "~/lib/graph/__tests__/helpers/createTestGraph";
import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex/mergeVertexProperties";

describe("isAdminRole", () => {
  it("returns true when userRoles includes Admin role vertex", () => {
    const { graph, setGraph } = createGraphWithGlobalStore();
    const adminRole = createVertex("roleAdmin", ["Role"], { key: "Admin" });
    const userRole = createVertex("roleUser", ["Role"], { key: "User" });
    seedVertex(setGraph, adminRole);
    seedVertex(setGraph, userRole);
    mergeVertexProperties(0, "globalStoreId", graph, setGraph, {
      userRoles: ["roleAdmin", "roleUser"],
    });
    expect(isAdminRole(graph)).toBe(true);
  });

  it("returns false when no Admin role is present", () => {
    const { graph, setGraph } = createGraphWithGlobalStore();
    seedVertex(setGraph, createVertex("roleUser", ["Role"], { key: "User" }));
    mergeVertexProperties(0, "globalStoreId", graph, setGraph, {
      userRoles: ["roleUser"],
    });
    expect(isAdminRole(graph)).toBe(false);
  });
});
