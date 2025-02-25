import { evalExpression } from "~/lib/expression_eval";

import type { GraphInterface, Vertex } from "../../graph";

import { getGlobalSettingVertex } from "./getGlobalThemeVertex";

export function getCompanyLogoVertex(
  graph: GraphInterface,
): undefined | Vertex {
  return evalExpression("->CompanyLogo", {
    graph,
    vertexes: [getGlobalSettingVertex(graph)],
  })?.[0];
}
