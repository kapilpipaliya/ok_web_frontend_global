
import type { APIEvent } from "@solidjs/start/dist/server";

import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";
import { createSuperUser } from "~/cypher/mutate/user/createSuperUser";

export async function GET({ request }: APIEvent) {
  const { dbSession } = await getDBSessionForSubdomain(request);
  try {
    const { dbSession, subDomain } = await getDBSessionForSubdomain();
    if (subDomain !== "super") {
      return new Response(
        JSON.stringify({
          error: "Not authorized",
        }),
        { status: 401 },
      );
    }

    const email = "superuser@easyformforge.com";
    const username = "superuser";
    const password = "kK11235813@";

    const user = await createSuperUser(email, username, password, dbSession);
    return user;
  } catch (error: unknown) {
    return new Response(
      error instanceof Error ? error.message : "Unknown error",
      { status: 500 },
    );
  } finally {
    await dbSession.close();
  }
}
