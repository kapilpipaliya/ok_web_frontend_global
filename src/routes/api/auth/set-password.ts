import type { APIEvent } from "@solidjs/start/server";

import { convertNodeToJson } from "~/cypher/conversion/convertNodeToJson";
import { createActivityLog } from "~/cypher/mutate/activity/createActivityLog";
import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { APIError, handleAPIError } from "~/lib/api/server/apiErrorHandler";
import { hashPassword } from "~/lib/auth/password";
import { validateAndConsumeToken } from "~/lib/auth/secureToken";
import { decodeUserData } from "~/lib/auth/userDataEncoder";
import { sendNotificationEmail } from "~/lib/playwright/sendNotificationEmail";
import { EMAIL_TEMPLATES } from "~/pages/settings/constants";
import { validatePassword } from "~/lib/validation/validatePassword";

export async function POST({ request }: APIEvent) {
  const { dbSession, subDomain } = await getDBSessionForSubdomain(request);

  try {
    const { newPassword, token } = await request.json();

    if (!(typeof token === "string" && token.trim())) {
      throw new APIError("Invalid or missing token", 400);
    }

    if (!(typeof newPassword === "string" && newPassword.length > 0)) {
      throw new APIError("Password is required", 400);
    }

    const passwordPolicyError = validatePassword(newPassword);
    if (passwordPolicyError) {
      throw new APIError(passwordPolicyError, 400);
    }

    const userPayload = await validateAndConsumeToken(token.trim(), dbSession);
    if (!userPayload) {
      throw new APIError("Invalid or expired token", 401);
    }

    const { uuid } = decodeUserData(userPayload);

    const user = await dbSession.executeWrite(async (tx) => {
      const userResult = await tx.run("MATCH (u:User {uuid: $uuid}) RETURN u", {
        uuid,
      });

      if (userResult.records.length === 0) {
        throw new APIError("User not found", 404);
      }

      const userVertex = convertNodeToJson(userResult.records[0].get("u"));
      const { hashedPassword, salt } = await hashPassword(newPassword);

      await tx.run(
        `MATCH (u:User {uuid: $uuid})
         SET u.password = $hashedPassword,
             u.salt = $salt,
             u.updatedAt = datetime(),
             u.emailConfirmed = true
         RETURN u`,
        { hashedPassword, salt, uuid },
      );

      await createActivityLog(
        tx,
        "invitation_password_set",
        "User",
        userVertex.P.uuid,
        userVertex.P.email,
        "Password set after invitation acceptance",
      );

      return userVertex;
    });

    sendNotificationEmail(
      EMAIL_TEMPLATES.PasswordChanged,
      {},
      "Your Password Has Been Set",
      user,
      subDomain,
    ).catch((error) => {
      console.error(
        "[set-password] Failed to send password confirmation email:",
        error,
      );
    });

    return {
      message: "Password saved successfully. You can sign in.",
      success: true,
    };
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
