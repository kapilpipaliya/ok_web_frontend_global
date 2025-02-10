import type { APIEvent } from "@solidjs/start/dist/server";
import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";
import { convertNodeToJson } from "~/cypher/convertNodeToJson";
import { getSelectionOptionsMGCall } from "~/cypher/get/client/getSelectionOptionsMGCall";

export async function POST({ request }: APIEvent) {
  const payload = await request.json();
  const { dbSession } = await getDBSessionForSubdomain(request);

  try {
    const { parentVertexId } = payload;
    const query = "MATCH (v) WHERE elementId(v) = $id RETURN v";
    const result = await dbSession.run(query, { id: parentVertexId });

    const messagesResult = await getSelectionOptionsMGCall(
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