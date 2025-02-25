import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";
import { checkRole } from "./checkPermission";
import { SYSTEM_ROLES } from "./types";

export async function checkAdminRole(request: Request): Promise<boolean> {
  const { dbSession } = await getDBSessionForSubdomain(request);
  
  try {
    return await checkRole(request, SYSTEM_ROLES.ADMIN, dbSession);
  } finally {
    await dbSession.close();
  }
} 