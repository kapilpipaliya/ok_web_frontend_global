import type { APIEvent } from "@solidjs/start/dist/server";

import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";
import { createActivityLog } from "~/routes/api/activity/createActivityLog";
import { checkAdminRole } from "~/server/session/checkAdminRole";
import { sendEmail } from "~/server/email/sendEmail";
import { getUserFromSession } from "~/server/session/getUserFromSession";

export async function POST({ request }: APIEvent) {
  const isAdmin = await checkAdminRole(request);
  
  if (!isAdmin) {
    return new Response(JSON.stringify({
      error: "Unauthorized. Admin access required."
    }), {
      headers: { "Content-Type": "application/json" },
      status: 403
    });
  }

  const { dbSession } = await getDBSessionForSubdomain(request);
  const settings = await request.json();
  const user = await getUserFromSession();

  try {
    // Test email sending with the new settings
    // TODO: temporary comment out
    // await sendEmail(settings.testEmail, {
    //   customHtml: `
    //     <h1>Test Email</h1>
    //     <p>This is a test email to verify your email settings.</p>
    //     <p>If you received this email, your email settings are working correctly.</p>
    //   `,
    //   subject: "Test Email Settings"
    // });

    const result = await dbSession.run(
      `MATCH (s:EmailSetting) 
       SET s += $settings,
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
          createdAt: datetime(),
          updatedAt: datetime()
        })
        SET s += $settings
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
      user?.P.email ?? "",
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