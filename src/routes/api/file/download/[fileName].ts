import type { APIEvent } from "@solidjs/start/server";

import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { APIError, handleAPIError } from "~/lib/api/server/apiErrorHandler";

import { downloadFile } from "../functions/downloadFile";

export async function GET({ request, params }: APIEvent) {
  const fileName = params.fileName;
  const { dbSession } = await getDBSessionForSubdomain(request);

  try {
    if (!fileName) {
      throw new APIError("File name is required", 400);
    }

    return await downloadFile(fileName as string, dbSession);
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
