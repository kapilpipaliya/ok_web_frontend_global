import { describe, it, expect, vi } from "vitest";
import { themeConfig } from "~/lib/graph/get/sync/theme/themeConfig";
import { createVertex } from "~/lib/graph/__tests__/helpers/createTestGraph";
import { DEFAULT_THEME } from "~/lib/styles/constants";

describe("themeConfig", () => {
  it("returns default theme when vertex has no data", () => {
    const cfg = themeConfig(undefined);
    expect(cfg.var).toEqual(DEFAULT_THEME);
  });

  it("merges JSON theme config from vertex data", () => {
    const vertex = createVertex("t1", ["Theme"], {
      data: JSON.stringify({
        var: { color: { primary: "oklch(0.5 0.2 250)" } },
        customFlag: true,
      }),
    });
    const cfg = themeConfig(vertex);
    expect(cfg.var?.color?.primary).toBe("oklch(0.5 0.2 250)");
    expect((cfg as any).customFlag).toBe(true);
  });

  it("evaluates function body theme data", () => {
    const vertex = createVertex("t2", ["Theme"], {
      data: "return { var: { color: { success: 'green' } } };",
    });
    expect(themeConfig(vertex).var?.color?.success).toBe("green");
  });

  it("returns default theme when JSON parse fails", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const vertex = createVertex("t3", ["Theme"], { data: "{ bad json" });
    expect(themeConfig(vertex).var).toEqual(DEFAULT_THEME);
    errorSpy.mockRestore();
  });
});
