import type { APIEvent } from "@solidjs/start/server";

import { fetchDataFromMG } from "~/cypher/get/fetchDataFromMG";
import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { checkRole } from "~/cypher/permissions/checkPermission";
import { SYSTEM_ROLES } from "~/cypher/permissions/types";
import { APIError, handleAPIError } from "~/lib/api/apiErrorHandler";
import { getEdgesFromRowsAttr } from "~/lib/graph/get/sync/getEdgesFromRowsAttr";
import { getUserFromSession } from "~/server/auth/session/getUserFromSession";

export async function POST({ request }: APIEvent) {
  const { dbSession } = await getDBSessionForSubdomain(request);
  const { id } = await request.json();
  if (!id) {
    throw new APIError("Id is required", 400);
  }

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

    // if (!isAdmin) {
    //   throw new APIError("Unauthorized. Admin access required.", 403);
    // }

    if (!user?.P?.email) {
      throw new Error("Unauthorized");
    }

    const { incoming, outgoing } = getEdgesFromRowsAttr([
      {
        componentName: "Text",
        key: "name",
      },
      {
        componentName: "Text",
        key: "email",
      },
      {
        componentName: "Text",
        key: "subject",
      },
      {
        componentName: "Text",
        key: "message",
      },
      {
        collection: "->$0SupportStatus",
        componentName: "Select",
        key: "SupportStatus",
      },
      {
        componentName: "Text",
        key: "createdAt",
      },
      {
        componentName: "DynamicTable",
        inward: true,
        key: "Reply",
        label: "Reply",
        type: "ParentSupport",
      },
    ]);
    const data = await fetchDataFromMG({
      expression: `id:'${id}'`,
      incoming,
      outgoing,
    });
    if (!isAdmin && data.result?.[0].P.email !== user.P.email) {
      throw new APIError("Unauthorized.", 403);
    }

    return data;
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
