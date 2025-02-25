import type { APIEvent } from "@solidjs/start/server";

import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";
import { findUserByEmail } from "~/cypher/mutate/user/findUserByEmail";
import { APIError, handleAPIError } from "~/lib/api/apiErrorHandler";
import { getUserFromSession } from "~/server/session/getUserFromSession";

export async function GET({ request }: APIEvent) {
  const { dbSession, subDomain } = await getDBSessionForSubdomain(request);
  try {
    const user = await getUserFromSession(request);
    // if (!user?.P?.email) {
    //   throw new APIError("Not Authorized", 401);
    // }

    const data = await findUserByEmail(dbSession, user?.P?.email, subDomain);

    if (!data.user) {
      throw new APIError("User not authorized", 401);
    }

    delete data.user.P.password;
    return data;
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
