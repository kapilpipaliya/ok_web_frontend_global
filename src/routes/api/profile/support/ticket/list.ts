import type { APIEvent } from "@solidjs/start/server";

import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";

export async function POST({ request }: APIEvent) {
  const { email } = await request.json();
  const { dbSession } = await getDBSessionForSubdomain(request);

  try {
    const result = await dbSession.run(
      "MATCH (n:Support {email: $email}) RETURN n ORDER BY n.createdAt DESC",
      { email },
    );

    const tickets = result.records.map((record) => {
      const node = record.get("n");
      return {
        ...node.properties,
        id: node.elementId,
      };
    });

    return new Response(JSON.stringify({ tickets }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 500,
      },
    );
  } finally {
    await dbSession.close();
  }
}
