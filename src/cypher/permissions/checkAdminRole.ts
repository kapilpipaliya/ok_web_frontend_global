import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { getUserFromSession } from "~/server/auth/session/getUserFromSession";

import { checkRole } from "./checkPermission";
import { SYSTEM_ROLES } from "./types";

export async function checkAdminRole(request: Request): Promise<boolean> {
  const { dbSession } = await getDBSessionForSubdomain(request);

  try {
    const user = await getUserFromSession(request);
    return await checkRole(request, SYSTEM_ROLES.ADMIN, dbSession, user);
  } finally {
    await dbSession.close();
  }
}
