import type { APIEvent } from "@solidjs/start/server";

import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { APIError, handleAPIError } from "~/lib/api/server/apiErrorHandler";
import { getUserFromSession } from "~/server/auth/session/getUserFromSession";

import { initChunkedUpload } from "../functions/chunkedUpload";

export async function POST({ request }: APIEvent) {
  const { dbSession, subDomain } = await getDBSessionForSubdomain(request);

  try {
    const user = await getUserFromSession(request);
    if (!user) {
      throw new APIError("Authentication required", 401);
    }

    const body = await request.json();
    const result = await initChunkedUpload({
      fileName: body?.fileName,
      fileSize: body?.fileSize,
      mimeType: body?.mimeType,
      chunkSize: body?.chunkSize,
      subDomain,
      neo4jSession: dbSession,
    });

    return result;
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
