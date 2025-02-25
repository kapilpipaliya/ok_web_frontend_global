import type { APIEvent } from "@solidjs/start/server";

import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";
import { insertComponents } from "~/cypher/mutate/signup/insertComponents";
import { APIError, handleAPIError } from "~/lib/api/apiErrorHandler";

export async function GET({ request }: APIEvent) {
  const { dbSession } = await getDBSessionForSubdomain(request);
  try {
    const response = await insertComponents(dbSession);

    if (!response.success) {
      throw new APIError("Failed to insert component tree", 500);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
