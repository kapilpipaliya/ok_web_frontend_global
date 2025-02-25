import type { APIEvent } from "@solidjs/start/server";

import { readMultipartFormData } from "vinxi/http";

import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";
import { APIError, handleAPIError } from "~/lib/api/apiErrorHandler";

import { replaceFiles } from "./functions/replaceFiles";

export async function PUT({ request }: APIEvent) {
  const { dbSession, subDomain } = await getDBSessionForSubdomain(request);

  try {
    const data = await readMultipartFormData();

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
