import { describe, it, expect } from "vitest";
import { getTitle } from "~/lib/graph/get/sync/theme/getTitle";
import {
  createEmptyGraph,
  createVertex,
  seedVertex,
} from "~/lib/graph/__tests__/helpers/createTestGraph";
import { APP_NAME, APP_VERSION } from "~/pages/settings/constants";

describe("getTitle", () => {
  it("uses global setting appName when graph is provided", () => {
    const { graph, setGraph } = createEmptyGraph();
    seedVertex(
      setGraph,
      createVertex("gs1", ["GlobalSetting"], { appName: "Custom App" }),
    );
    expect(getTitle("Dashboard", graph)).toBe(
      `Dashboard | Custom App v${APP_VERSION}`,
    );
  });

  it("uses default app name without graph", () => {
    expect(getTitle(" Home ")).toBe(`Home | ${APP_NAME} v${APP_VERSION}`);
  });
});
