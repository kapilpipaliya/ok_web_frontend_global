import { variables } from "@master/css";

import type { Vertex } from "../../lib/graph/graph";

export function themeConfig(themeVertex?: Vertex) {
  const themeConfig = themeVertex?.P?.data;
  if (!themeConfig) {
    return {};
  }

  if (themeConfig.trim().startsWith("{")) {
    return JSON.parse(themeConfig);
  }
  if (themeConfig.trim()) {
    try {
      const configFunction = new Function("variables", themeConfig);
      return configFunction(variables) || {};
    } catch (error) {
      console.error("Error evaluating theme config function:", error);
      return {};
    }
  }
  return {};
}
