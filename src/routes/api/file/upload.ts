import type { APIEvent } from "@solidjs/start/server";
import type { HTTPEvent } from "vinxi/runtime/http-types";

import { readMultipartFormData } from "vinxi/http";

import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";
import { APIError, handleAPIError } from "~/lib/api/apiErrorHandler";
import { uploadFiles } from "~/server/upload/uploadFile";

export async function POST({ request }: APIEvent, event: HTTPEvent) {
  const { dbSession, subDomain } = await getDBSessionForSubdomain(request);

  try {
    const data = await readMultipartFormData(event);
    if (!data || data.length === 0) {
      throw new APIError("No file data available", 400);
    }
    return await uploadFiles(data, subDomain, dbSession);
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
