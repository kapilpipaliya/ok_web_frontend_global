import type { APIEvent } from "@solidjs/start/server";

import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";
import { APIError, handleAPIError } from "~/lib/api/apiErrorHandler";
import { sendNotificationEmail } from "~/lib/playwright/sendNotificationEmail";
import { EMAIL_TEMPLATES } from "~/pages/settings/constants";
import { getUserFromSession } from "~/server/auth/session/getUserFromSession";

import { updateProfile } from "./functions/updateProfile";

export async function POST({ request }: APIEvent) {
  const payload = await request.json();
  const { dbSession, subDomain } = await getDBSessionForSubdomain(request);

  const user = await getUserFromSession(request);

  if (!user) {
    throw new APIError("User not found", 404);
  }
  if (user.P.uuid !== payload.uuid) {
    throw new APIError("User not authorized", 401);
  }

  try {
    const result = await updateProfile(request, user, payload, dbSession, subDomain);

    if ("error" in result) {
      throw new APIError(result.error || "Failed to update profile", result.status || 500);
    }

    // Fire and forget the email sending process
    sendNotificationEmail(
      EMAIL_TEMPLATES.PROFILE_UPDATED,
      {},
      "Your Profile Has Been Updated",
      result.result,
      subDomain,
    ).catch((error) => {
      console.error("Failed to send profile updated email:", error);
    });

    return result;
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
