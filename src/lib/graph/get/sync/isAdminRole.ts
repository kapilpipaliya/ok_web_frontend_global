import type { GraphInterface } from "~/lib/graph/graph";

import { getGlobalStore } from "~/lib/graph/get/sync/getGlobalStore";

export function isAdminRole(graph: GraphInterface) {
  return getGlobalStore(graph).P.userRoles?.some(
    (role) => graph.vertexes[role].P.key === "Admin",
  );
}
