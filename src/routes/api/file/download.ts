import type { APIEvent } from "@solidjs/start/dist/server";
import type { HTTPEvent } from "vinxi/runtime/http-types";

import { Session } from "neo4j-driver";
import fs from "node:fs/promises";
import { getQuery } from "vinxi/http";

import { getSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";
import { getFileMetadataFromNeo4j } from "~/server/upload/saveFileMetadataToNeo4j";

async function downloadFile(fileId: string, session: Session) {
  const fileMetadata = await getFileMetadataFromNeo4j(session, fileId);

  if (!fileMetadata) {
    return new Response(JSON.stringify({ error: "File not found" }), {
      headers: { "Content-Type": "application/json" },
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
      JSON.stringify({ error: "Error reading file from disk" }),
      {
        headers: { "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
}

export async function GET({ request }: APIEvent, event: HTTPEvent) {
  const query = getQuery(event);
  const fileId = query.fileId;
  const neo4jSession = await getSessionForSubdomain(request);

  if (!fileId) {
    return new Response(JSON.stringify({ error: "File ID is required" }), {
      headers: { "Content-Type": "application/json" },
      status: 400,
    });
  }

  try {
    return await downloadFile(fileId as string, neo4jSession);
  } finally {
    await neo4jSession.close();
  }
}
