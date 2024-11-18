import type { APIEvent } from "@solidjs/start/dist/server";

import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";
import { createRootFolder } from "~/cypher/mutate/signup/createRootFolder";
import { createSuperUser } from "~/cypher/mutate/user/createSuperUser";

import { superUserData } from "../../../../tests/auth/data/signUpData";

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

    const user = await createSuperUser(
      superUserData.email,
      superUserData.username,
      superUserData.password,
      dbSession,
    );

    if ('error' in user) {
      return new Response(JSON.stringify(user), { status: 400 });
    }
    
    await createRootFolder(dbSession, user.P.uuid);

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
