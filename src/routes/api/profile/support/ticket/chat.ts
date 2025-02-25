import type { APIEvent } from "@solidjs/start/server";

import { convertNodeToJson } from "~/cypher/convertNodeToJson";
import { getSelectionOptionsAPICall } from "~/cypher/get/client/getSelectionOptionsAPICall";
import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";

export async function POST({ request }: APIEvent) {
  const payload = await request.json();
  const { dbSession } = await getDBSessionForSubdomain(request);

  try {
    const { parentVertexId } = payload;
    const query = "MATCH (v) WHERE elementId(v) = $id RETURN v";
    const result = await dbSession.run(query, { id: parentVertexId });

    const messagesResult = await getSelectionOptionsAPICall(
      [convertNodeToJson(result.records[0].get("v"))],
      "->SupportUser",
      undefined,
      10,
    );
    return messagesResult.result;
  } catch (error: any) {
    return new Response(error.message, { status: 500 });
  } finally {
    await dbSession.close();
  }
}
