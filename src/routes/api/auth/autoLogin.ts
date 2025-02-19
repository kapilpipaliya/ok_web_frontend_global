import type { APIEvent } from "@solidjs/start/server";

import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";
import { findUserByEmailSimple } from "~/cypher/mutate/user/findUserByEmail";
import { APIError, handleAPIError } from "~/lib/api/apiErrorHandler";
import { validateAndConsumeToken } from "~/lib/auth/secureToken";
import { decodeUserData } from "~/lib/auth/userDataEncoder";
import { updateSession } from "~/server/session/updateSession";

import { updateRedirectUrl } from "./functions/updateRedirectUrl";

export async function GET({ request }: APIEvent) {
  const { dbSession, subDomain } = await getDBSessionForSubdomain(request);

  try {
    const url = new URL(request.url);
    const token = url.searchParams.get("token");
    const redirectUrl = url.searchParams.get("redirect");

    // Get all query parameters except token and redirect
    const queryParams = new URLSearchParams();
    for (const [key, value] of url.searchParams.entries()) {
      if (key !== "token" && key !== "redirect") {
        queryParams.append(key, value);
      }
    }

    if (!token) {
      throw new APIError("Invalid or missing token", 400);
    }

    // Validate and consume the token
    const userData = await validateAndConsumeToken(token, dbSession);
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

    updateRedirectUrl(existingUser, subDomain, redirectUrl, queryParams);
    await updateSession(existingUser);

    return new Response(null, {
      headers: { Location: existingUser.P.redirectUrl },
      status: 302,
    });
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
