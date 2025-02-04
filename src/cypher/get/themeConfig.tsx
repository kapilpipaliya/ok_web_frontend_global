import { getGlobalThemeVertex } from "../../lib/graph/get/sync/getGlobalThemeVertex";
import { GraphInterface } from "../../lib/graph/graph";

export function themeConfig(graph: GraphInterface) {
  const themeConfig = getGlobalThemeVertex(graph)?.P?.data;
  return themeConfig ? JSON.parse(themeConfig) : {};
}
