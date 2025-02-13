import type { APIEvent } from "@solidjs/start/dist/server";

import type { SMTPSettings } from "~/lib/email/types";

import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";
import { sendTestEmail } from "~/lib/email/sendTestEmail";
import { createActivityLog } from "~/routes/api/activity/createActivityLog";
import { getUserEmailFromSession } from "~/server/getUserEmailFromSession";

export async function POST({ request }: APIEvent) {
  const { dbSession } = await getDBSessionForSubdomain(request);
  const settings = await request.json() as SMTPSettings;
  const email = await getUserEmailFromSession();

  try {
    // Send test email using the provided SMTP settings
    await sendTestEmail(settings);

    await createActivityLog(
      dbSession,
      "TEST_EMAIL_SETTINGS",
      "EmailSetting",
      "email",
      email ?? "",
      `Tested email settings with SMTP host: ${settings.smtpHost}`
    );

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200
    });

  } catch (error) {
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : "An unknown error occurred"
    }), {
      headers: { "Content-Type": "application/json" },
      status: 500
    });
  } finally {
    await dbSession.close();
  }
} 