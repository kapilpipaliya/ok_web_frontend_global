import type { APIEvent } from "@solidjs/start/server";

import { SYSTEM_DB_NAME } from "~/cypher/boltConstant";
import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";
import { createActivityLog } from "~/cypher/mutate/activity/createActivityLog";
import { APIError, handleAPIError } from "~/lib/api/apiErrorHandler";
import { checkAdminRole } from "~/cypher/permissions/checkAdminRole";
import { getUserFromSession } from "~/server/auth/session/getUserFromSession";

import { createOrUpdateAccountEmailSettings } from "./functions";

export async function POST({ request }: APIEvent) {
  const { dbSession, subDomain } = await getDBSessionForSubdomain(request);

  try {
    const isAdmin = await checkAdminRole(request);
    if (!isAdmin) {
      throw new APIError("Unauthorized. Admin access required.", 403);
    }

    const settings = await request.json();
    const user = await getUserFromSession(request);

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
    let settingsKey;
    if (subDomain === SYSTEM_DB_NAME) {
      // Get account ID for the current user
      const accountResult = await dbSession.run(
        `MATCH (a:Account)-[:AccountUser]->(u:User {uuid: $uuid})
         RETURN a.id as accountId`,
        { uuid: user?.P.uuid },
      );
      const accountId = accountResult.records[0]?.get("accountId");

      if (!accountId) {
        throw new APIError("Account not found", 404);
      }

      // Create or update account-specific email settings
      settingsKey = await createOrUpdateAccountEmailSettings(
        dbSession,
        accountId,
        settings,
      );
    } else {
      const result = await dbSession.run(
        `MATCH (s:EmailSetting) 
         SET s += $settings,
             s.updatedAt = datetime() 
         RETURN s.key as key`,
        { settings },
      );

      if (result.records.length === 0) {
        const newKey = `email_settings_${Date.now()}`;
        const createResult = await dbSession.run(
          `CREATE (s:EmailSetting {
            key: $key,
            createdAt: datetime(),
            updatedAt: datetime()
          })
          SET s += $settings
          RETURN s.key as key`,
          { key: newKey, settings },
        );
        settingsKey = createResult.records[0].get("key");
      } else {
        settingsKey = result.records[0].get("key");
      }
    }

    await createActivityLog(
      dbSession,
      "UPDATE_EMAIL_SETTINGS",
      "EmailSetting",
      settingsKey,
      user?.P.email ?? "",
      "Updated email settings",
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
