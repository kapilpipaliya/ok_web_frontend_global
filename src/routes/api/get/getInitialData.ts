import type { APIEvent } from "@solidjs/start/server";

import { getInitialData } from "~/cypher/get/getInitialData";
import { handleAPIError } from "~/lib/api/apiErrorHandler";

export async function GET({ request }: APIEvent) {
  try {
    const data = await getInitialData(request);
    return data;
  } catch (error: unknown) {
    return handleAPIError(error);
  }
}
