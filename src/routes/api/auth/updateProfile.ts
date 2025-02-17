import type { APIEvent } from "@solidjs/start/dist/server";

import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";
import { APIError, handleAPIError } from "~/lib/api/apiErrorHandler";
import { renderPageAsMHtml } from "~/lib/playwright/renderPageAsMHtml";
import { sendEmailWithAttachment } from "~/lib/playwright/sendEmailWithAttachment";

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

    const emailResult = await renderPageAsMHtml({
      neo4jSession: dbSession,
      pageName: EMAIL_TEMPLATES.PROFILE_UPDATED,
      queryParams: {
        updateTime: new Date().toISOString(),
        username: result.user.P.username
      },
      subDomain,
    });

    if (emailResult.success && emailResult.result) {
      const fileVertex = emailResult.result[0];
      await sendEmailWithAttachment({
        emailSubject: "Your Profile Has Been Updated",
        emailTo: result.user.P.email,
        fileVertex,
        subDomain
      });
    }
    
    return result;
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
