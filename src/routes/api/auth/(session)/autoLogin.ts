import type { APIEvent } from "@solidjs/start/server";

import { SYSTEM_DB_NAME } from "~/cypher/core/boltConstant";
import { getDriver } from "~/cypher/core/driver";
import { findUserByEmailSimple } from "~/cypher/mutate/user/findUserByEmail";
import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { API } from "~/lib/api/endpoints";
import { APIError, handleAPIError } from "~/lib/api/server/apiErrorHandler";
import { validateAndConsumeToken } from "~/lib/auth/secureToken";
import { decodeUserData } from "~/lib/auth/userDataEncoder";
import { updateRedirectUrl } from "~/routes/api/auth/(user)/functions/updateRedirectUrl";
import { updateSession } from "~/server/auth/session/updateSession";

export async function GET({ request }: APIEvent) {
  const { dbSession, subDomain } = await getDBSessionForSubdomain(request);
  const superDbSession = (await getDriver()).session({
    database: SYSTEM_DB_NAME,
  });

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
    const userData = await validateAndConsumeToken(token, superDbSession);
    if (!userData) {
      // "Invalid or expired token"
      return new Response(null, {
        headers: { Location: API.urls.admin.login },
        status: 302,
      });
    }

    const { email } = decodeUserData(userData);
    const existingUser = await findUserByEmailSimple(dbSession, email);

    if (!existingUser) {
      return new Response(null, {
        headers: { Location: API.urls.admin.login },
        status: 302,
      });
    }

    updateRedirectUrl(existingUser, subDomain, redirectUrl, queryParams);
    if (existingUser.P.isSystemUser) {
      const superUser = await findUserByEmailSimple(
        superDbSession,
        existingUser.P.email,
      );
      if (superUser) {
        await updateSession(superUser);
      }
    } else {
      await updateSession(existingUser);
    }

    return new Response(null, {
      headers: { Location: existingUser.P.redirectUrl },
      status: 302,
    });
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
    await superDbSession.close();
  }
}
