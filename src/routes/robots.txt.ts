import type { APIEvent } from "@solidjs/start/server";

import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { handleAPIError } from "~/lib/api/server/apiErrorHandler";

const TEXT_PLAIN = { "Content-Type": "text/plain" };

export async function GET({ request }: APIEvent) {
  const { dbSession } = await getDBSessionForSubdomain(request);
  try {
    const result = await dbSession.run(
      `MATCH (r:RobotsTxt) RETURN r.robotsTxt as robotsTxt LIMIT 1`,
    );
    const robotsTxt =
      (result.records[0]?.get("robotsTxt") as string | undefined) ?? "";
    return new Response(robotsTxt, {
      headers: TEXT_PLAIN,
    });
  } catch (error) {
    handleAPIError(error);
    return new Response("", { status: 200, headers: TEXT_PLAIN });
  } finally {
    await dbSession.close();
  }
}
