import type { Vertex } from "~/lib/graph/graph";

import { SYSTEM_DB_NAME } from "~/cypher/boltConstant";

export function updateRedirectUrl(user: Vertex, subDomain: string) {
  user.P.redirectUrl = subDomain === SYSTEM_DB_NAME ? "/admin/projects" : "/admin/settings";
}
