import type { APIEvent } from "@solidjs/start/dist/server";

import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";
import { createActivityLog } from "~/routes/api/activity/createActivityLog";
import { getUserEmailFromSession } from "~/server/getUserEmailFromSession";
import { sendEmail } from "~/server/sendEmail";

export async function POST({ request }: APIEvent) {
  const { dbSession } = await getDBSessionForSubdomain(request);
  const settings = await request.json();
  const email = await getUserEmailFromSession();

  try {
    // Test email sending with the new settings
    await sendEmail(settings.testEmail, {
      subject: "Test Email Settings",
      customHtml: `
        <h1>Test Email</h1>
        <p>This is a test email to verify your email settings.</p>
        <p>If you received this email, your email settings are working correctly.</p>
      `
    });

    const result = await dbSession.run(
      `MATCH (s:EmailSetting) 
       SET s.email = $settings,
           s.updatedAt = datetime() 
       RETURN s.key as key`,
      { settings }
    );

    let settingsKey: string;
    if (result.records.length === 0) {
      const newKey = `email_settings_${Date.now()}`;
      const createResult = await dbSession.run(
        `CREATE (s:EmailSetting {
          key: $key,
          email: $settings,
          createdAt: datetime(),
          updatedAt: datetime()
        })
        RETURN id(s) as id`,
        { key: newKey, settings }
      );
      settingsKey = createResult.records[0].get('key');
    } else {
      settingsKey = result.records[0].get('key');
    }

    await createActivityLog(
      dbSession,
      "UPDATE_EMAIL_SETTINGS",
      "EmailSetting",
      settingsKey,
      email ?? "",
      "Updated email settings"
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