import type { APIEvent } from "@solidjs/start/dist/server";

import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";
import { APIError, handleAPIError } from "~/lib/api/apiErrorHandler";
import { renderPageAsHtml } from "~/lib/playwright/renderPageAsHtml";

import { EMAIL_TEMPLATES } from "./constants/constants";
import { updateProfile } from "./functions/updateProfile";
import { sendEmail } from "~/lib/playwright/sendEmail";

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

    const emailResult = await renderPageAsHtml({
      pageName: EMAIL_TEMPLATES.PROFILE_UPDATED,
      queryParams: {
        updateTime: new Date().toISOString(),
        username: result.user.P.username,
      },
      subDomain,
    });

    if (emailResult.success && emailResult.html) {
      await sendEmail({
        content: emailResult.html!,
        subDomain,
        subject: "Your Profile Has Been Updated",
        to: result.user.P.email,
      });
    }

    return result;
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
