import { findUserByEmail } from "~/cypher/mutate/user/findUserByEmail";
import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { APIError, handleAPIError } from "~/lib/api/server/apiErrorHandler";
import { getUserFromSession } from "~/server/auth/session/getUserFromSession";

export async function getUserRPC() {
  "use server";
  const { dbSession, subDomain } = await getDBSessionForSubdomain();
  try {
    const user = await getUserFromSession();
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
