import type { APIEvent } from "@solidjs/start/server";

import { setupSuperUser } from "~/cypher/mutate/manage/setupSuperUser";
import { APIError, handleAPIError } from "~/lib/api/server/apiErrorHandler";

export async function GET({ request }: APIEvent) {
  try {
    const { error, status, user } = await setupSuperUser();

    if (error) {
      throw new APIError(error, status);
    }

    return {
      graph: {
        edges: {},
        vertexes: { [user!.id]: user! },
      },
      result: user!,
    };
  } catch (error: unknown) {
    return handleAPIError(error);
  }
}
