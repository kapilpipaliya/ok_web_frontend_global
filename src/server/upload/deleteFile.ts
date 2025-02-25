import type { Session } from "neo4j-driver";

import fs from "node:fs/promises";

import { deleteFileMetadataFromNeo4j } from "~/server/upload/utils/deleteFileMetadataFromNeo4j";
import { getFileMetadataFromNeo4j } from "~/server/upload/utils/getFileMetadataFromNeo4j";

export async function deleteFile(fileId: string, neo4jSession: Session) {
  const fileMetadata = await getFileMetadataFromNeo4j(neo4jSession, fileId);

  if (!fileMetadata) {
    return new Response(JSON.stringify({ error: "File not found" }), {
      headers: { "Content-Type": "application/json" },
      status: 404,
    });
  }

  try {
    const filePath = fileMetadata.P.filePath;
    await fs.unlink(filePath); // Delete the file from the disk

    await deleteFileMetadataFromNeo4j(neo4jSession, fileId);

    return {
      graph: {
        deleted_vertexes: [fileId],
      },
      success: true,
    };
  } catch (error: any) {
    return {
      error: `Error deleting file ${error.message}`,
      success: false,
    };
  }
}
