import type { APIEvent } from "@solidjs/start/server";

import { readMultipartFormData } from "vinxi/http";

import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { APIError, handleAPIError } from "~/lib/api/server/apiErrorHandler";
import { getUserFromSession } from "~/server/auth/session/getUserFromSession";

import { uploadFiles } from "./functions/uploadFile";

export async function POST({ request }: APIEvent) {
  const { dbSession, subDomain } = await getDBSessionForSubdomain(request);

  try {
    const data = await readMultipartFormData();
    if (!data || data.length === 0) {
      throw new APIError("No file data available", 400);
    }
    const user = await getUserFromSession(request);
    const linkUuid = user?.P?.uuid != null ? String(user.P.uuid).trim() : null;
    return await uploadFiles(data, subDomain, dbSession, linkUuid || undefined);
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
