import type { APIEvent } from "@solidjs/start/server";

import { getQuery } from "vinxi/http";

import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { APIError, handleAPIError } from "~/lib/api/server/apiErrorHandler";

import { downloadFile } from "./functions/downloadFile";

export async function GET({ request }: APIEvent) {
  const query = getQuery();
  const fileName = query.fileName;
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
