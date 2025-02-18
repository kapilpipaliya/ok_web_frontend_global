import type { APIEvent } from "@solidjs/start/dist/server";
import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";
import { convertNodeToJson } from "~/cypher/convertNodeToJson";
import { handleAPIError } from "~/lib/api/apiErrorHandler";
import { getUserFromSession } from "~/server/session/getUserFromSession";

export async function GET({ request }: APIEvent) {
  const { dbSession } = await getDBSessionForSubdomain(request);

  try {
    const user = await getUserFromSession(request);
    if (!user?.P?.email) {
      throw new Error("Unauthorized");
    }

    const result = await dbSession.run(`
      MATCH (r:Role)
      RETURN r
      ORDER BY r.name ASC
    `);

    const roles = result.records.map((record) => 
      convertNodeToJson(record.get("r"))
    );

    return new Response(JSON.stringify({ roles }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
} 