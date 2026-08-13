import type { APIEvent } from "@solidjs/start/server";

import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { APIError, handleAPIError } from "~/lib/api/server/apiErrorHandler";
import { readMultipartFormDataFromRequest } from "~/lib/http/multipart";
import { getUserFromSession } from "~/server/auth/session/getUserFromSession";

import {
  uploadFilesWithFolderOptions,
  uploadFromRemoteUrlOptions,
} from "../functions/uploadFile";

export async function POST({ request }: APIEvent) {
  const { dbSession, subDomain } = await getDBSessionForSubdomain(request);

  try {
    const user = await getUserFromSession(request);
    const linkUuid = user?.P?.uuid == null ? null : String(user.P.uuid).trim();
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const body = (await request.json()) as Record<string, unknown>;
      return await uploadFromRemoteUrlOptions(
        body || {},
        subDomain,
        dbSession,
        linkUuid || undefined,
      );
    }

    const data = await readMultipartFormDataFromRequest(request);
    if (!data || data.length === 0) {
      throw new APIError("No file data available", 400);
    }
    return await uploadFilesWithFolderOptions(
      data,
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
