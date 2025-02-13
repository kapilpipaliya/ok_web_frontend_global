import { getGlobalStore } from "~/lib/graph/get/sync/getGlobalStore";
import { GraphInterface } from "~/lib/graph/graph";

export function isAdminRole(graph: GraphInterface) {
  return getGlobalStore(graph).P.userRoles?.some(role => graph.vertexes[role].P.key === "Admin");
}
