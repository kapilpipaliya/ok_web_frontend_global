import type { GraphInterface } from "../../lib/graph/graph";

import { getGlobalThemeVertex } from "../../lib/graph/get/sync/getGlobalThemeVertex";

export function themeConfig(graph: GraphInterface) {
  const themeConfig = getGlobalThemeVertex(graph)?.P?.data;
  return themeConfig ? JSON.parse(themeConfig) : {};
}
