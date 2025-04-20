import type { Vertex } from "../../../graph";

export function themeConfig(themeVertex?: Vertex) {
  const themeConfig = themeVertex?.P?.data;
  if (!themeConfig) {
    return {};
  }

  if (themeConfig.trim().startsWith("{")) {
    try {
      return JSON.parse(themeConfig);
    } catch (error) {
      console.error("Error parsing theme config JSON:", error);
      return {};
    }
  }
  if (themeConfig.trim()) {
    try {
      const configFunction = new Function("variables", themeConfig);
      return configFunction({}) || {};
    } catch (error) {
      console.error("Error evaluating theme config function:", error);
      return {};
    }
  }
  return {};
}
