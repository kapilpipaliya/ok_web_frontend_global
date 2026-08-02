import type { APIEvent } from "@solidjs/start/server";

import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { APIError, handleAPIError } from "~/lib/api/server/apiErrorHandler";
import { getUserFromSession } from "~/server/auth/session/getUserFromSession";

import { saveUploadChunk } from "../functions/chunkedUpload";

function fieldValue(formData: FormData, name: string) {
  const value = formData.get(name);
  if (value == null || value instanceof File) return "";
  return String(value).trim();
}

export async function POST(event: APIEvent) {
  const { request, nativeEvent } = event;
  const { dbSession, subDomain } = await getDBSessionForSubdomain(request);

  try {
    const user = await getUserFromSession(request);
    if (!user) {
      throw new APIError("Authentication required", 401);
    }

    const formData = await nativeEvent.req.formData();
    if ([...formData.keys()].length === 0) {
      throw new APIError("No chunk data available", 400);
    }

    const uploadId = fieldValue(formData, "uploadId");
    const chunkIndex = Number(fieldValue(formData, "chunkIndex"));
    const totalChunks = Number(fieldValue(formData, "totalChunks"));
    const chunkPart =
      formData.get("chunk") ??
      [...formData.values()].find((value) => value instanceof File);
    if (!(chunkPart instanceof Blob)) {
      throw new APIError("Chunk binary missing", 400);
    }

    return await saveUploadChunk({
      uploadId,
      chunkIndex,
      totalChunks,
      chunkData: Buffer.from(await chunkPart.arrayBuffer()),
      subDomain,
    });
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
