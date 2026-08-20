import fs from "node:fs";
import type { APIEvent } from "@solidjs/start/server";

import { convertNodeToJson } from "~/cypher/conversion/convertNodeToJson";
import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { APIError, handleAPIError } from "~/lib/api/server/apiErrorHandler";
import { getUserFromSession } from "~/server/auth/session/getUserFromSession";

export async function GET({ request }: APIEvent) {
  const { dbSession } = await getDBSessionForSubdomain(request);

  try {
    const user = await getUserFromSession(request);
    if (!user) {
      throw new APIError("Unauthorized", 401);
    }

    const result = await dbSession.run(`
      MATCH (g:GlobalSetting {key: 'Default'})
      RETURN g
    `);
    const node = result.records[0]?.get("g");
    const setting = node ? convertNodeToJson(node) : null;
    const filePath = String(setting?.P?.zoomLastRecordingPath || "");

    if (!filePath || !fs.existsSync(filePath)) {
      throw new APIError("No Playwright recording found", 404);
    }

    const stat = fs.statSync(filePath);
    const file = fs.readFileSync(filePath);

    return new Response(file, {
      headers: {
        "Content-Type": "video/webm",
        "Content-Length": String(stat.size),
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
