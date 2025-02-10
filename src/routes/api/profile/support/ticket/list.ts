import type { APIEvent } from "@solidjs/start/dist/server";

import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";

export async function POST({ request }: APIEvent) {
  const payload = await request.json();
  const { dbSession } = await getDBSessionForSubdomain(request);

  try {
    const { email } = payload;

    const query = "MATCH (n:Support {email: $email}) RETURN n;";
    const result = await dbSession.run(query, { email });

    const data = result.records.map((r) => {
      const data = r.get("n").properties;
      data.id = r.get("n").elementId;
      return data;
    });

    return {
      contact: data,
    };
  } catch (error: any) {
    return new Response(error.message, { status: 500 });
  } finally {
    await dbSession.close();
  }
}
