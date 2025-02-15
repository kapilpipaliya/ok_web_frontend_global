import type { APIEvent } from "@solidjs/start/dist/server";

import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";
import { findUserByEmail } from "~/cypher/mutate/user/findUserByEmail";
import { getUserFromSession } from "~/server/session/getUserFromSession";

export async function GET({ request }: APIEvent) {
  const { dbSession, subDomain } = await getDBSessionForSubdomain(request);
  try {
    const user = await getUserFromSession(request);
    // if (!email) {
    //   return new Response(
    //     JSON.stringify({
    //       error: "Not Authorized",
    //     }),
    //     { status: 401 },
    //   );
    // }
    const data = await findUserByEmail(dbSession, user?.P?.email, subDomain);

    if (!data.user) {
      return data;
    }

    delete data.user.P.password;

    return data;
  } catch (error: unknown) {
    return new Response(
      error instanceof Error ? error.message : "Unknown error",
      { status: 500 },
    );
  } finally {
    await dbSession.close();
  }
}
