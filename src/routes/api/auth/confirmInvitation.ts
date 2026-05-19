import type { APIEvent } from "@solidjs/start/server";

import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { API } from "~/lib/api/endpoints";
import { APIError, handleAPIError } from "~/lib/api/server/apiErrorHandler";
import {
  generateSecureToken,
  validateAndConsumeToken,
} from "~/lib/auth/secureToken";
import { decodeUserData } from "~/lib/auth/userDataEncoder";

export async function GET({ request }: APIEvent) {
  const { dbSession } = await getDBSessionForSubdomain(request);

  try {
    const url = new URL(request.url);
    const token = url.searchParams.get("token");

    if (!token) {
      throw new APIError("Invalid or missing token", 400);
    }

    // Validate and consume the token
    const userData = await validateAndConsumeToken(token, dbSession);
    if (!userData) {
      return new Response(null, {
        headers: { Location: `${API.urls.admin.signIn}?error=invalid_token` },
        status: 302,
      });
    }

    const { uuid } = decodeUserData(userData);

    // Update user status from "invited" to "active"
    const result = await dbSession.run(
      `MATCH (u:User {uuid: $uuid, status: "invited"})
       SET u.status = "active",
           u.emailConfirmed = true
       RETURN coalesce(u.username, "") AS username, coalesce(u.email, "") AS email`,
      { uuid },
    );

    if (result.records.length === 0) {
      return new Response(null, {
        headers: {
          Location: `${API.urls.admin.signIn}?error=invalid_invitation`,
        },
        status: 302,
      });
    }

    const row = result.records[0];
    const usernameFromDb = String(row.get("username") ?? "").trim();
    const emailFromDb = String(row.get("email") ?? "").trim();

    // Invitation token was consumed; mint a one-time token for the set-password page only.
    const setPasswordToken = await generateSecureToken(userData, dbSession);

    const redirectParams = new URLSearchParams();
    redirectParams.set("token", setPasswordToken);
    if (usernameFromDb) {
      redirectParams.set("username", usernameFromDb);
    }
    if (emailFromDb) {
      redirectParams.set("email", emailFromDb);
    }

    return new Response(null, {
      headers: {
        Location: `/auth/set-password?${redirectParams.toString()}`,
      },
      status: 302,
    });
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
