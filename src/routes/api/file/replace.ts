import type { APIEvent } from "@solidjs/start/dist/server";
import type { HTTPEvent } from "vinxi/runtime/http-types";

import { readMultipartFormData } from "vinxi/http";

import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";
import { APIError, handleAPIError } from "~/lib/api/apiErrorHandler";
import { replaceFiles } from "~/server/upload/replaceFiles";

export async function PUT({ request }: APIEvent, event: HTTPEvent) {
  const { dbSession, subDomain } = await getDBSessionForSubdomain(request);

  try {
    const data = await readMultipartFormData(event);

    if (!data || data.length === 0) {
      throw new APIError("No file data available", 400);
    }
    return await replaceFiles(request, data, dbSession, subDomain);
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
