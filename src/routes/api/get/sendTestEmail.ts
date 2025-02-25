import type { APIEvent } from "@solidjs/start/server";

import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";
import { APIError, handleAPIError } from "~/lib/api/apiErrorHandler";
import { generateSecureToken } from "~/lib/auth/secureToken";
import { encodeUserData, type UserData } from "~/lib/auth/userDataEncoder";
import { sendNotificationEmail } from "~/lib/playwright/sendNotificationEmail";
import { getUserFromSession } from "~/server/auth/session/getUserFromSession";


import {EMAIL_TEMPLATES} from "~/pages/settings/constants";

export async function GET({ request }: APIEvent) {
  // const { email } = await request.json(); // Extract email from request body
  const { dbSession, subDomain } = await getDBSessionForSubdomain(request);

  const user = await getUserFromSession(request);

  if (!user) {
    throw new APIError("User not found", 404);
  }

  // Generate a secure token instead of passing user data directly
  const secureToken = user
    ? await generateSecureToken(encodeUserData(user.P as UserData), dbSession)
    : undefined;

  try {
    await sendNotificationEmail(
      EMAIL_TEMPLATES.TEST_EMAIL,
      {
        param1: "value1",
        param2: "value2",
      },
      "Test Email",
      user,
      subDomain,
      secureToken,
    );

    return {
      message: "Test email sent successfully",
    };
  } catch (error: unknown) {
    return handleAPIError(error);
  }
}
