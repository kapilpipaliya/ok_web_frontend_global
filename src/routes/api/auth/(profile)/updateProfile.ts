import type { APIEvent } from "@solidjs/start/dist/server";

import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";
import { APIError, handleAPIError } from "~/lib/api/apiErrorHandler";
import { sendNotificationEmail } from "~/lib/playwright/sendNotificationEmail";

import { EMAIL_TEMPLATES } from "./constants/constants";
import { updateProfile } from "./functions/updateProfile";

export async function POST({ request }: APIEvent) {
  const payload = await request.json();
  const { dbSession, subDomain } = await getDBSessionForSubdomain(request);

  try {
    if (!payload.uuid) {
      throw new APIError("UUID is required", 400);
    }

    const result = await updateProfile(payload, dbSession, subDomain);

    if ("error" in result) {
      throw new APIError(result.error, result.status || 500);
    }

    // Fire and forget the email sending process
    sendNotificationEmail(EMAIL_TEMPLATES.PROFILE_UPDATED, {}, "Your Profile Has Been Updated", result.user, subDomain).catch(error => {
      console.error('Failed to send profile updated email:', error);
    });

    return result;
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
