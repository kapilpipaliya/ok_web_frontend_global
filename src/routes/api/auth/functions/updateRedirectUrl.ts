import type { Vertex } from "~/lib/graph/graph";

import { SYSTEM_DB_NAME } from "~/cypher/boltConstant";
import { URLS } from "~/pages/constants/URLS";

export function updateRedirectUrl(user: Vertex, subDomain: string) {
  user.P.redirectUrl = subDomain === SYSTEM_DB_NAME ? URLS.SYSTEM.PROJECTS : URLS.ADMIN.USER_SETTINGS;
}
