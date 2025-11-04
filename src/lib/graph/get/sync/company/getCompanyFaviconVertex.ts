import { evalExpression } from "~/lib/expression_eval";
import { getGlobalSettingVertex } from "~/lib/graph/get/sync/store/getGlobalSettingVertex";

import type { Vertex } from "~/lib/graph/type/vertex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export function getCompanyFaviconVertex(
  graph: GraphInterface,
): undefined | Vertex {
  return evalExpression("->CompanyFavicon", {
    graph,
    vertexes: [getGlobalSettingVertex(graph)],
  })?.[0];
}
