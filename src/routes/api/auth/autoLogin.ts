import type { APIEvent } from "@solidjs/start/dist/server";

import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";
import { updateSession } from "~/server/session/updateSession";
import { findUserByEmailSimple } from "~/cypher/mutate/user/findUserByEmail";
import { validateAndConsumeToken } from "~/lib/auth/secureToken";
import { decodeUserData } from "~/lib/auth/userDataEncoder";

import { updateRedirectUrl } from "./functions/updateRedirectUrl";

export async function GET({ request }: APIEvent) {
  const { dbSession, subDomain } = await getDBSessionForSubdomain(request);
  
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return new Response(JSON.stringify({ error: "Invalid or missing token" }), {
        headers: { "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Validate and consume the token
    const userData = await validateAndConsumeToken(token, request);
    if (!userData) {
      // "Invalid or expired token"
      return new Response(null, {
        headers: { Location: "/auth/login" },
        status: 302,
      });
    }

    const { email } = decodeUserData(userData);
    const existingUser = await findUserByEmailSimple(dbSession, email);

    if (!existingUser) {
      return new Response(null, {
        headers: { Location: "/auth/login" },
        status: 302,
      });
    }

    updateRedirectUrl(existingUser, subDomain);
    await updateSession(existingUser);

    return new Response(null, {
      headers: { Location: existingUser.P.redirectUrl },
      status: 302,
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : "An unknown error occurred"
    }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  } finally {
    await dbSession.close();
  }
}
