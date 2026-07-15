import type { APIEvent } from "@solidjs/start/server";

import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { APIError, handleAPIError } from "~/lib/api/server/apiErrorHandler";
import { getUserFromSession } from "~/server/auth/session/getUserFromSession";

import { completeChunkedUpload } from "../functions/chunkedUpload";

export async function POST({ request }: APIEvent) {
  const { dbSession, subDomain } = await getDBSessionForSubdomain(request);

  try {
    const user = await getUserFromSession(request);
    if (!user) {
      throw new APIError("Authentication required", 401);
    }

    const body = await request.json();
    const linkUuid = user?.P?.uuid == null ? null : String(user.P.uuid).trim();

    return await completeChunkedUpload({
      uploadId: body?.uploadId,
      subDomain,
      neo4jSession: dbSession,
      linkUserUuid: linkUuid || undefined,
      label: body?.label,
    });
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
