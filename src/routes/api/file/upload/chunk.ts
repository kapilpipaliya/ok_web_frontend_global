import type { APIEvent } from "@solidjs/start/server";

import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { APIError, handleAPIError } from "~/lib/api/server/apiErrorHandler";
import { readMultipartFormDataFromRequest } from "~/lib/http/multipart";
import { getUserFromSession } from "~/server/auth/session/getUserFromSession";

import { saveUploadChunk } from "../functions/chunkedUpload";

function fieldValue(
  parts: { name?: string; data?: Buffer }[] | undefined,
  name: string,
) {
  const part = parts?.find((entry) => entry?.name === name);
  if (!part?.data) return "";
  return part.data.toString("utf8").trim();
}

export async function POST({ request }: APIEvent) {
  const { dbSession, subDomain } = await getDBSessionForSubdomain(request);

  try {
    const user = await getUserFromSession(request);
    if (!user) {
      throw new APIError("Authentication required", 401);
    }

    const data = await readMultipartFormDataFromRequest(request);
    if (!data || data.length === 0) {
      throw new APIError("No chunk data available", 400);
    }

    const uploadId = fieldValue(data, "uploadId");
    const chunkIndex = Number(fieldValue(data, "chunkIndex"));
    const totalChunks = Number(fieldValue(data, "totalChunks"));
    const chunkPart = data.find(
      (entry) => entry?.name === "chunk" || entry?.filename,
    );
    if (!chunkPart?.data) {
      throw new APIError("Chunk binary missing", 400);
    }

    return await saveUploadChunk({
      uploadId,
      chunkIndex,
      totalChunks,
      chunkData: chunkPart.data,
      subDomain,
    });
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
