import type { APIEvent } from "@solidjs/start/dist/server";

import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";

import { findUserByEmail } from "../../../cypher/mutate/user/findUserByEmail";
import { getUserEmailFromSession } from "../../../server/getUserEmailFromSession";

export async function GET({ request }: APIEvent) {
  const { dbSession } = await getDBSessionForSubdomain(request);
  try {
    const email = await getUserEmailFromSession();
    const {user} = await findUserByEmail(dbSession, email);

    if (!user) {
      return new Response(
        JSON.stringify({
          error: `Not Authorized`,
        }),
        { status: 401 },
      );
    }

    delete user.P.password;

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
