import type { APIEvent } from "@solidjs/start/server";

import { ADMIN_DB_NAME } from "~/cypher/core/boltConstant";
import { checkRole } from "~/cypher/permissions/isPermission";
import { SYSTEM_ROLES } from "~/cypher/permissions/type/types";
import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { APIError, handleAPIError } from "~/lib/api/server/apiErrorHandler";
import { getSetting } from "~/lib/api/server/settings/settingsFunctions";
import { getUserFromSession } from "~/server/auth/session/getUserFromSession";

export async function GET({ request }: APIEvent) {
  const { dbSession, subDomain } = await getDBSessionForSubdomain(request);

  try {
    const user = await getUserFromSession(request);

    if (!user) {
      throw new APIError("User not found", 404);
    }

    const isAdmin = await checkRole(SYSTEM_ROLES.ADMIN, dbSession, user);

    if (!isAdmin) {
      throw new APIError("Unauthorized. Admin access required.", 403);
    }

    // Get setting type from query params
    const url = new URL(request.url);
    const type = url.searchParams.get("type");

    if (!type) {
      throw new APIError("Setting type is required", 400);
    }

    let accountId: string | undefined;
    if (subDomain === ADMIN_DB_NAME) {
      // Get account ID for account-specific settings
      const accountResult = await dbSession.run(
        `MATCH (a:Account)-[:AccountUser]->(u:User {uuid: $uuid})
         RETURN a.id as accountId`,
        { uuid: user?.P.uuid },
      );
      accountId = accountResult.records[0]?.get("accountId");

      if (!accountId) {
        throw new APIError("Account not found", 404);
      }
    }

    return await getSetting(dbSession, type, accountId);
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
