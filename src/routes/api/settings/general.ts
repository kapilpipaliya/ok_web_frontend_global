import type { APIEvent } from "@solidjs/start/dist/server";

import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";
import { createActivityLog } from "~/routes/api/activity/createActivityLog";
import { checkAdminRole } from "~/server/session/checkAdminRole";
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
  const user = await getUserFromSession(request);

  try {
    // First check if GlobalSetting exists
    const checkResult = await dbSession.run(
      `MATCH (s:GlobalSetting) 
       RETURN s.key as key`
    );

    let settingsKey: string;
    
    if (checkResult.records.length === 0) {
      // Create new GlobalSetting if none exists
      const newKey = `global_setting_${Date.now()}`;
      const createResult = await dbSession.run(
        `CREATE (s:GlobalSetting {
          key: $key,
          createdAt: datetime(),
          updatedAt: datetime()
        })
        SET s += $settings
        RETURN s.key as key`,
        { key: newKey, settings }
      );
      settingsKey = createResult.records[0].get('key');
    } else {
      // Update existing GlobalSetting
      const result = await dbSession.run(
        `MATCH (s:GlobalSetting)
         SET s += $settings,
             s.updatedAt = datetime()
         RETURN s.key as key`,
        { settings: settings }
      );
      settingsKey = result.records[0].get('key');
    }

    await createActivityLog(
      dbSession,
      "UPDATE_GLOBAL_SETTING",
      "GlobalSetting",
      settingsKey,
      user?.P?.email ?? "",
      "Updated global settings"
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