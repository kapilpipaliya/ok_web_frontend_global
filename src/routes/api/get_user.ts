import type { APIEvent } from "@solidjs/start/dist/server";
import type { Session } from "neo4j-driver";

import { getSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";

import { findUserByEmail } from "./user/findUserByEmail";
import { getUserEmailFromSession } from "./user/getUserEmailFromSession";

export async function GET({ request }: APIEvent) {
  let neo4jSession: Session | undefined;
  try {
    neo4jSession = await getSessionForSubdomain(request);

    const email = await getUserEmailFromSession();
    const response = await findUserByEmail(neo4jSession, email);

    if (!response.user) {
      return new Response(
        JSON.stringify({
          error: `Not Authorized: No user found with email or username ${email}`,
        }),
        { status: 401 },
      );
    }

    delete response.user.P.password;

    return new Response(JSON.stringify(response), { status: 200 });
  } catch (error: unknown) {
    return new Response(
      error instanceof Error ? error.message : "Unknown error",
      { status: 500 },
    );
  } finally {
    if (neo4jSession) {
      neo4jSession.close();
    }
  }
}
