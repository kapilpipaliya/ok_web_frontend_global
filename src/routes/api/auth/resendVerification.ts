import type { APIEvent } from "@solidjs/start/server";

import { convertNodeToJson } from "~/cypher/conversion/convertNodeToJson";
import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { APIError, handleAPIError } from "~/lib/api/server/apiErrorHandler";
import { sendSignupEmailVerification } from "~/routes/api/auth/(profile)/functions/sendSignupEmailVerification";

export async function POST({ request }: APIEvent) {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    throw new APIError("Invalid content type. Expected application/json", 415);
  }

  const { dbSession, subDomain } = await getDBSessionForSubdomain(request);

  try {
    const { identifier } = await request.json();

    if (!identifier) {
      throw new APIError("Email or username is required", 400);
    }

    // Find user by email or username
    const userResult = await dbSession.run(
      "MATCH (u:User) WHERE u.email = $identifier OR u.username = $identifier RETURN u",
      { identifier: identifier.toLowerCase() },
    );

    if (userResult.records.length === 0) {
      // For security, don't reveal if identifier exists or not
      return {
        message:
          "If an account with this email or username exists and is not verified, a confirmation email has been sent.",
        success: true,
      };
    }

    const user = convertNodeToJson(userResult.records[0].get("u"));

    // Check if email is already confirmed
    if (user.P.emailConfirmed) {
      return {
        message: "This email is already verified. You can sign in now.",
        success: true,
      };
    }

    // Check if the user's account is pending deletion
    if (user.P.pendingDeletion === true) {
      throw new APIError(
        "This account is scheduled for deletion. Please contact support.",
        403,
      );
    }

    // Resend verification email
    await sendSignupEmailVerification(request, dbSession, user, subDomain);

    return {
      message:
        "If an account with this email or username exists and is not verified, a confirmation email has been sent.",
      success: true,
    };
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
