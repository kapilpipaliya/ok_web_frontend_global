import type { APIEvent } from "@solidjs/start/dist/server";
import type { HTTPEvent } from "vinxi/runtime/http-types";

import { getQuery } from "vinxi/http";

import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";
import { APIError, handleAPIError } from "~/lib/api/apiErrorHandler";
import { deleteFile } from "~/server/upload/deleteFile";

export async function DELETE({ request }: APIEvent, event: HTTPEvent) {
  const query = getQuery(event);
  const fileId = query.fileId;

  if (!fileId) {
    throw new APIError("File ID is required", 400);
  }

  const { dbSession } = await getDBSessionForSubdomain(request);

  try {
    return await deleteFile(fileId as string, dbSession);
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
