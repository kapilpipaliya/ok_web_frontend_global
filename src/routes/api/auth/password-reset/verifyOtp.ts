import type { APIEvent } from "@solidjs/start/server";

import { convertNodeToJson } from "~/cypher/conversion/convertNodeToJson";
import { createActivityLog } from "~/cypher/mutate/activity/createActivityLog";
import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { APIError, handleAPIError } from "~/lib/api/server/apiErrorHandler";
import { confirmUserEmailAcrossPlatform } from "~/lib/auth/confirmUserEmailAcrossPlatform";
import { assertUserCanChangePasswordLocally } from "~/lib/auth/systemUserPasswordChange";

export async function POST({ request }: APIEvent) {
  const { dbSession, subDomain } = await getDBSessionForSubdomain(request);

  try {
    const { otp, resetSessionToken, userUuid } = await request.json();

    if (!(userUuid && otp && resetSessionToken)) {
      throw new APIError("Missing required fields", 400);
    }

    // Check if the OTP is valid, not expired, and matches the session token
    const result = await dbSession.run(
      `MATCH (u:User {uuid: $userUuid})
       WHERE u.resetOTP = $otp 
         AND u.resetOTPExpiry > datetime() 
         AND u.resetSessionToken = $resetSessionToken
       RETURN u`,
      { otp, resetSessionToken, userUuid },
    );

    if (result.records.length === 0) {
      throw new APIError("Invalid or expired OTP", 401);
    }

    const user = convertNodeToJson(result.records[0].get("u"));

    assertUserCanChangePasswordLocally(user, subDomain);

    // Mark the OTP as verified by setting a flag (but don't clear it yet)
    await dbSession.run(
      `MATCH (u:User {uuid: $uuid})
       SET u.resetOTPVerified = true,
           u.emailConfirmed = true,
           u.updatedAt = datetime()
       RETURN u`,
      { uuid: user.P.uuid },
    );

    await confirmUserEmailAcrossPlatform({
      dbSession,
      email: user.P.email,
      subDomain,
      uuid: user.P.uuid,
    });

    // Log the OTP verification
    await createActivityLog(
      dbSession,
      "password_reset_otp_verified",
      "User",
      user.P.uuid,
      user.P.email,
      "Password reset OTP was verified successfully",
    );

    return {
      message: "OTP verified successfully",
      success: true,
    };
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
