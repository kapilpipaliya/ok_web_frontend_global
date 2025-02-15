import type { APIEvent } from "@solidjs/start/dist/server";

import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";
import { insertComponents } from "~/cypher/mutate/signup/insertComponents";

export async function GET({ request }: APIEvent) {
  const { dbSession } = await getDBSessionForSubdomain(request);
  try {
    const response = await insertComponents(dbSession);

    if (!response.success) {
      return new Response(
        JSON.stringify({
          error: "Failed to insert component tree",
        }),
        { status: 500 },
      );
    }

    return { success: true };
  } catch (error: unknown) {
    return new Response(
      error instanceof Error ? error.message : "Unknown error",
      { status: 500 },
    );
  } finally {
    await dbSession.close();
  }
}
