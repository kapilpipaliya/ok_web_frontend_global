import { describe, it, expect } from "vitest";
import { getGlobalThemeVertex } from "~/lib/graph/get/sync/store/getGlobalThemeVertex";
import {
  createEmptyGraph,
  createVertex,
  createEdge,
  seedVertex,
} from "~/lib/graph/__tests__/helpers/createTestGraph";
import { addNewEdge } from "~/lib/graph/mutate/core/edge/addNewEdge";

describe("getGlobalThemeVertex", () => {
  it("follows Theme edge from global setting", () => {
    const { graph, setGraph } = createEmptyGraph();
    const gs = createVertex("gs1", ["GlobalSetting"], {});
    const theme = createVertex("th1", ["Theme"], { key: "DefaultTheme" });
    seedVertex(setGraph, gs);
    seedVertex(setGraph, theme);
    addNewEdge(
      0,
      createEdge("e1", "GlobalSettingTheme", "gs1", "th1"),
      graph,
      setGraph,
    );

    expect(getGlobalThemeVertex(graph)?.id).toBe("th1");
  });

  it("returns undefined without global setting", () => {
    const { graph } = createEmptyGraph();
    expect(getGlobalThemeVertex(graph)).toBeUndefined();
  });
});
