import type { APIEvent } from "@solidjs/start/server";

import { fetchDataFromMG } from "~/cypher/get/fetchDataFromMG";
import { checkRole } from "~/cypher/permissions/checkPermission";
import { SYSTEM_ROLES } from "~/cypher/permissions/types";
import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { APIError, handleAPIError } from "~/lib/api/apiErrorHandler";
import { getEdgesFromRowsAttr } from "~/lib/graph/get/sync/getEdgesFromRowsAttr";
import { userFormSchema } from "~/pages/global/user/userFormSchema";
import { getUserFromSession } from "~/server/auth/session/getUserFromSession";

export async function GET({ request }: APIEvent) {
  const { dbSession } = await getDBSessionForSubdomain(request);

  try {
    const user = await getUserFromSession(request);

    if (!user) {
      throw new APIError("User not found", 404);
    }

    const isAdmin = await checkRole(
      request,
      SYSTEM_ROLES.ADMIN,
      dbSession,
      user,
    );

    if (!isAdmin) {
      throw new APIError("Unauthorized. Admin access required.", 403);
    }

    if (!user?.P?.email) {
      throw new Error("Unauthorized");
    }

    const { incoming, outgoing } = getEdgesFromRowsAttr(
      userFormSchema.attributes!,
    );

    const data = await fetchDataFromMG({
      expression: `g:'User'`,
      incoming,
      outgoing,
    });

    return data;
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
