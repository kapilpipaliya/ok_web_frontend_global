import { describe, it, expect, vi } from "vitest";
import {
  setUserData,
  clearUserData,
} from "~/lib/graph/mutate/user/setUserData";
import { handleUserNavigation } from "~/lib/graph/mutate/user/loadUser";
import {
  createGraphWithGlobalStore,
  createVertex,
  createEdge,
  seedVertex,
} from "~/lib/graph/__tests__/helpers/createTestGraph";
import { addNewEdge } from "~/lib/graph/mutate/core/edge/addNewEdge";

describe("setUserData", () => {
  it("writes user-related ids onto global store", () => {
    const { graph, setGraph } = createGraphWithGlobalStore();
    const user = createVertex("u1", ["User"], {});
    const setting = createVertex("s1", ["UserSetting"], {});
    const role = createVertex("r1", ["Role"], { key: "Admin" });
    const file = createVertex("f1", ["File"], {});

    setUserData(graph, setGraph, {
      user,
      userSetting: setting,
      roles: [role],
      profileImage: file,
    });

    const gs = graph.vertexes.globalStoreId.P;
    expect(gs.userId).toBe("u1");
    expect(gs.userSettingId).toBe("s1");
    expect(gs.userRoles).toEqual(["r1"]);
    expect(gs.profileImageId).toBe("f1");
  });
});

describe("clearUserData", () => {
  it("removes user-owned vertices and clears global store fields", () => {
    const { graph, setGraph } = createGraphWithGlobalStore();
    const user = createVertex("u1", ["User"], {});
    const setting = createVertex("s1", ["UserSetting"], {});
    const file = createVertex("f1", ["File"], {});
    const role = createVertex("r1", ["Role"], { key: "Admin" });
    seedVertex(setGraph, user);
    seedVertex(setGraph, setting);
    seedVertex(setGraph, file);
    seedVertex(setGraph, role);
    addNewEdge(0, createEdge("e1", "UserRole", "u1", "r1"), graph, setGraph);

    setUserData(graph, setGraph, {
      user,
      userSetting: setting,
      profileImage: file,
      roles: [role],
    });

    clearUserData(graph, setGraph);

    expect(graph.vertexes.u1).toBeUndefined();
    expect(graph.vertexes.s1).toBeUndefined();
    expect(graph.vertexes.f1).toBeUndefined();
    expect(graph.vertexes.r1).toBeDefined();
    expect(graph.vertexes.globalStoreId.P.userId).toBeUndefined();
    expect(graph.vertexes.globalStoreId.P.userRoles).toBeUndefined();
  });
});

describe("handleUserNavigation", () => {
  it("returns false and navigates to sign-in when user is missing", () => {
    const navigate = vi.fn();
    const location = { pathname: "/admin", search: "?x=1" } as any;
    expect(handleUserNavigation(null, navigate, location)).toBe(false);
    expect(navigate).toHaveBeenCalled();
  });

  it("returns true when user is present", () => {
    expect(
      handleUserNavigation({ user: createVertex("u", ["User"], {}) }),
    ).toBe(true);
  });
});
