import type {Session} from "neo4j-driver";

import fs from "node:fs/promises";

import {getFileMetadataFromNeo4j} from "~/server/upload/utils/getFileMetadataFromNeo4j";

export async function downloadFile(fileId: string, session: Session) {
  const fileMetadata = await getFileMetadataFromNeo4j(session, fileId);

  if (!fileMetadata) {
    return new Response(JSON.stringify({error: "File not found"}), {
      headers: {"Content-Type": "application/json"},
      status: 404,
    });
  }

  try {
    const filePath = fileMetadata.P.filepath;
    const fileData = await fs.readFile(filePath);

    // Ensure the filename is safe for headers
    const filename = encodeURIComponent(fileMetadata.P.originalFilename);

    return new Response(fileData, {
      headers: {
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Type": fileMetadata.P.mimeType,
      },
      status: 200,
    });
  } catch (_error) {
    return new Response(
      JSON.stringify({error: "Error reading file from disk"}),
      {
        headers: {"Content-Type": "application/json"},
        status: 500,
      },
    );
  }
}