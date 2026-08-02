import type { APIEvent } from "@solidjs/start/server";

import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { APIError, handleAPIError } from "~/lib/api/server/apiErrorHandler";
import { getUserFromSession } from "~/server/auth/session/getUserFromSession";

import { uploadFilesWithFolderOptions } from "../functions/uploadFile";

export async function POST(event: APIEvent) {
  const { request, nativeEvent } = event;
  const { dbSession, subDomain } = await getDBSessionForSubdomain(request);

  try {
    const formData = await nativeEvent.req.formData();
    if ([...formData.keys()].length === 0) {
      throw new APIError("No file data available", 400);
    }
    const user = await getUserFromSession(request);
    const linkUuid = user?.P?.uuid == null ? null : String(user.P.uuid).trim();
    return await uploadFilesWithFolderOptions(
      formData,
      subDomain,
      dbSession,
      linkUuid || undefined,
    );
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
