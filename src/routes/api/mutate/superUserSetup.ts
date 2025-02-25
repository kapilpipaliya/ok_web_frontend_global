import type { APIEvent } from "@solidjs/start/server";

import { setupSuperUser } from "~/cypher/mutate/manage/setupSuperUser";
import { APIError, handleAPIError } from "~/lib/api/apiErrorHandler";

export async function GET({ request }: APIEvent) {
  try {
    const { error, status, user } = await setupSuperUser();

    if (error) {
      throw new APIError(error, status);
    }

    return new Response(JSON.stringify(user), {
      headers: { "Content-Type": "application/json" },
      status,
    });
  } catch (error: unknown) {
    return handleAPIError(error);
  }
}
