import type { APIEvent } from "@solidjs/start/dist/server";
import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";
import { validateAndConsumeToken } from "~/lib/auth/secureToken";
import { decodeUserData } from "~/lib/auth/userDataEncoder";

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
      return new Response(null, {
        headers: { Location: "/auth/login?error=invalid_token" },
        status: 302,
      });
    }

    const { email } = decodeUserData(userData);

    // Update user's emailConfirmed status
    const result = await dbSession.run(
      `MATCH (u:User {email: $email})
       SET u.emailConfirmed = true
       RETURN u`,
      { email }
    );

    if (result.records.length === 0) {
      return new Response(null, {
        headers: { Location: "/auth/login?error=user_not_found" },
        status: 302,
      });
    }

    // Redirect to login page with success message
    return new Response(null, {
      headers: { Location: "/auth/login?message=email_confirmed" },
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