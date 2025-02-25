import type { APIEvent } from "@solidjs/start/server";

import { fetchDataFromMG } from "~/cypher/get/fetchDataFromMG";
import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";
import { handleAPIError } from "~/lib/api/apiErrorHandler";
import { getEdgesFromRowsAttr } from "~/lib/graph/get/sync/getEdgesFromRowsAttr";
import { roleFormSchema } from "~/pages/global/role/functions/formSchema";
import { getUserFromSession } from "~/server/session/getUserFromSession";

export async function POST({ request }: APIEvent) {
  const { dbSession } = await getDBSessionForSubdomain(request);

  try {
    const user = await getUserFromSession(request);
    if (!user?.P?.email) {
      throw new Error("Unauthorized");
    }

    const { id } = await request.json();

    const { incoming, outgoing } = getEdgesFromRowsAttr(
      roleFormSchema.attributes,
    );
    const data = await fetchDataFromMG({
      expression: `id:'${id}'`,
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
