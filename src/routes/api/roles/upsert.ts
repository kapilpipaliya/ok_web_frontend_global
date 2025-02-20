import type { APIEvent } from "@solidjs/start/dist/server";

import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";
import { mutateData } from "~/cypher/mutate/mutation_handlers/mutateData";
import { APIError, handleAPIError } from "~/lib/api/apiErrorHandler";
import { getUserFromSession } from "~/server/session/getUserFromSession";

export async function POST({ request }: APIEvent) {
  const { dbSession } = await getDBSessionForSubdomain(request);

  try {
    const _user = await getUserFromSession(request);
    // const [graph] = useGraph();

    // if (!(user?.P?.email && isAdminRole(graph))) {
    //   throw new APIError("Unauthorized", 401);
    // }

    const { data, role } = await request.json();

    const existingRole = await dbSession.run(
      "MATCH (r:Role {key: $key}) where elementId(r) <> $elementId RETURN r",
      { elementId: role.id, key: role.P.key },
    );

    if (existingRole.records.length > 0) {
      throw new APIError("Role with this name already exists", 400);
    }

    const tx = dbSession.beginTransaction();
    try {
      const res = await mutateData(data, tx);
      await tx.commit();
      return res;
    } catch (error: unknown) {
      await tx.rollback();
      throw error;
    } finally {
      await tx.close();
    }
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
