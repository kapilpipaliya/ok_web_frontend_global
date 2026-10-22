import { describe, it, expect } from "vitest";
import { getGlobalSettingVertex } from "~/lib/graph/get/sync/store/getGlobalSettingVertex";
import {
  createEmptyGraph,
  createVertex,
  seedVertex,
} from "~/lib/graph/__tests__/helpers/createTestGraph";

describe("getGlobalSettingVertex", () => {
  it("returns first GlobalSetting vertex from label map", () => {
    const { graph, setGraph } = createEmptyGraph();
    const gs = createVertex("gs1", ["GlobalSetting"], { appName: "App" });
    seedVertex(setGraph, gs);
    expect(getGlobalSettingVertex(graph)?.id).toBe("gs1");
  });

  it("returns undefined when no global setting exists", () => {
    const { graph } = createEmptyGraph();
    expect(getGlobalSettingVertex(graph)).toBeUndefined();
  });
});
