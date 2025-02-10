import type { APIEvent } from "@solidjs/start/dist/server";

import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";

export async function POST({ request }: APIEvent) {
  const payload = await request.json();
  const { dbSession } = await getDBSessionForSubdomain(request);

  try {
    const { id, status } = payload;

    const query =
      "MATCH (n) WHERE elementId(n) = $id SET n.status = $status SET n.updatedAt = localDateTime() RETURN n;";
    await dbSession.run(query, { id, status });
    return {
      message: "Status updated successfully",
    };
  } catch (error: any) {
    return new Response(error.message, { status: 500 });
  } finally {
    await dbSession.close();
  }
}
