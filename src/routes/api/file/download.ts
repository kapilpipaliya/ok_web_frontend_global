import type { APIEvent } from "@solidjs/start/server";

import { getQuery } from "vinxi/http";

import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";
import { APIError, handleAPIError } from "~/lib/api/apiErrorHandler";

import { downloadFile } from "./functions/downloadFile";


export async function GET({ request }: APIEvent) {
  const query = getQuery();
  const fileId = query.fileId;
  const { dbSession } = await getDBSessionForSubdomain(request);

  try {
    if (!fileId) {
      throw new APIError("File ID is required", 400);
    }

    return await downloadFile(fileId as string, dbSession);
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
