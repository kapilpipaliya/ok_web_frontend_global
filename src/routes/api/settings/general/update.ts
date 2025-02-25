import type { APIEvent } from "@solidjs/start/server";

import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";
import { createActivityLog } from "~/cypher/mutate/activity/createActivityLog";
import { APIError, handleAPIError } from "~/lib/api/apiErrorHandler";
import { checkAdminRole } from "~/server/session/checkAdminRole";
import { getUserFromSession } from "~/server/session/getUserFromSession";

export async function POST({ request }: APIEvent) {
  const { dbSession } = await getDBSessionForSubdomain(request);

  try {
    const isAdmin = await checkAdminRole(request);

    if (!isAdmin) {
      throw new APIError("Unauthorized. Admin access required.", 403);
    }
    const settings = await request.json();
    const user = await getUserFromSession(request);

    // First check if GlobalSetting exists
    const checkResult = await dbSession.run(
      `MATCH (s:GlobalSetting) 
       RETURN s.key as key`,
    );

    let settingsKey: string;

    if (checkResult.records.length === 0) {
      // Create new GlobalSetting if none exists
      const newKey = "Default"; // `global_setting_${Date.now()}`;
      const createResult = await dbSession.run(
        `CREATE (s:GlobalSetting {
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
      // Update existing GlobalSetting
      const result = await dbSession.run(
        `MATCH (s:GlobalSetting)
         SET s += $settings,
             s.updatedAt = datetime()
         RETURN s.key as key`,
        { settings: settings },
      );
      settingsKey = result.records[0].get("key");
    }

    await createActivityLog(
      dbSession,
      "UPDATE_GLOBAL_SETTING",
      "GlobalSetting",
      settingsKey,
      user?.P?.email ?? "",
      "Updated global settings",
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
