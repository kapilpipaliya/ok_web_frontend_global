import type { Session } from "neo4j-driver";
import fs from "node:fs/promises";
import { getFileMetadataById } from "~/routes/api/file/functions/functions/getFileMetadataById";
import { APIError } from "~/lib/api/server/apiErrorHandler";

import type { Vertex } from "~/lib/graph/type/vertex";

interface FileMetadata {
  filePath: string;
  originalFileName: string;
  mimeType: string;
}

/**
 * Downloads a file from the server's file system and returns it as a Response
 * @param fileId - The ID of the file to download
 * @param dbSession - Neo4j database session
 * @returns Response object containing the file data or an error message
 * @throws APIError if the file is not found or cannot be read
 */
export async function downloadFileById(
  fileId: string,
  dbSession: Session,
): Promise<Response> {
  const fileMetadata = await getFileMetadataById(dbSession, fileId);

  if (!fileMetadata) {
    throw new APIError("File not found", 404);
  }

  try {
    const metadata = fileMetadata as Vertex<FileMetadata>;
    const { filePath, originalFileName, mimeType } = metadata.P;
    const fileData = await fs.readFile(filePath);

    // Ensure the filename is safe for headers using RFC 5987 encoding
    const encodedFileName = encodeURIComponent(originalFileName);

    return new Response(fileData, {
      headers: {
        "Content-Disposition": `attachment; filename*=UTF-8''${encodedFileName}`,
        "Content-Type": mimeType,
      },
      status: 200,
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    throw new APIError(`Error reading file from disk: ${errorMessage}`, 500);
  }
}
