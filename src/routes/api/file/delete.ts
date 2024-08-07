import type { APIEvent } from "@solidjs/start/dist/server";
import type { HTTPEvent } from "vinxi/runtime/http-types";

import fs from "node:fs/promises";
import { getQuery } from "vinxi/http";

import { getSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";
import {
  deleteFileMetadataFromNeo4j,
  getFileMetadataFromNeo4j,
} from "~/routes/api/upload/saveFileMetadataToNeo4j";

export async function DELETE({ request }: APIEvent, event: HTTPEvent) {
  const query = getQuery(event);
  const fileId = query.fileId;
  const neo4jSession = await getSessionForSubdomain(request);

  if (!fileId) {
    return new Response(JSON.stringify({ error: "File ID is required" }), {
      headers: { "Content-Type": "application/json" },
      status: 400,
    });
  }

  const fileMetadata = await getFileMetadataFromNeo4j(
    neo4jSession,
    fileId as string,
  );

  if (!fileMetadata) {
    return new Response(JSON.stringify({ error: "File not found" }), {
      headers: { "Content-Type": "application/json" },
      status: 404,
    });
  }

  try {
    const filePath = fileMetadata.P.filepath;
    await fs.unlink(filePath); // Delete the file from the disk

    await deleteFileMetadataFromNeo4j(neo4jSession, fileId as string);

    return new Response(
      JSON.stringify({ message: "File deleted successfully" }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (_error) {
    return new Response(JSON.stringify({ error: "Error deleting file" }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
}
