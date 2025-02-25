import type { APIEvent } from "@solidjs/start/server";

import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";
import { createActivityLog } from "~/cypher/mutate/activity/createActivityLog";
import { APIError, handleAPIError } from "~/lib/api/apiErrorHandler";
// import { sendTestEmail } from "~/lib/email/sendTestEmail";
import { checkAdminRole } from "~/server/auth/permissions/checkAdminRole";
import { getUserFromSession } from "~/server/auth/session/getUserFromSession";

export interface SMTPSettings {
  fromEmail: string;
  smtpHost: string;
  smtpPassword: string;
  smtpPort: number;
  smtpUsername: string;
}

export async function POST({ request }: APIEvent) {
  const { dbSession } = await getDBSessionForSubdomain(request);

  try {
    const isAdmin = await checkAdminRole(request);
    if (!isAdmin) {
      throw new APIError("Unauthorized. Admin access required.", 403);
    }

    const settings = (await request.json()) as SMTPSettings;
    const user = await getUserFromSession(request);

    await sendTestEmail(settings);

    await createActivityLog(
      dbSession,
      "TEST_EMAIL_SETTINGS",
      "EmailSetting",
      "email",
      user?.P?.email ?? "",
      `Tested email settings with SMTP host: ${settings.smtpHost}`,
    );

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
