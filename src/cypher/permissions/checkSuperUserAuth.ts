import type { Session } from "neo4j-driver";

import { SYSTEM_DB_NAME } from "~/cypher/core/boltConstant";

import { getUserFromSession } from "../../server/auth/session/getUserFromSession";
import { checkRole } from "./checkPermission";
import { SYSTEM_ROLES } from "./types";

export async function checkSuperUserAuthorization(
  request: Request,
  subDomain: string,
  dbSession: Session,
  isMutate = false,
) {
  if (subDomain !== SYSTEM_DB_NAME) {
    return null;
  }

  const user = await getUserFromSession(request);
  if (!user) {
    return {
      error: `Access Denied: Authentication required to ${isMutate ? "make changes" : "view information"} in this area.`,
    };
  }

  const isSystemUser = await checkRole(
    request,
    SYSTEM_ROLES.SUPER_USER,
    dbSession,
    user,
  );
  if (!isSystemUser) {
    return {
      error: `Access Denied: Super User privileges required to ${isMutate ? "make changes" : "view information"} in this area.`,
    };
  }

  return null;
}
