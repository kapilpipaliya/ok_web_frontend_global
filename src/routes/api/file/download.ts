import type {APIEvent} from "@solidjs/start/dist/server";
import type {HTTPEvent} from "vinxi/runtime/http-types";

import fs from "node:fs/promises";
import {getQuery} from "vinxi/runtime/http-types";

import {getSessionForSubdomain} from "~/cypher/get/getSessionForSubdomain";
import {getFileMetadataFromNeo4j} from "~/routes/api/upload/saveFileMetadataToNeo4j";

export async function GET({request}: APIEvent, event: HTTPEvent) {
  const query = getQuery(event);
  const fileId = query.fileId;
  const neo4jSession = await getSessionForSubdomain(request);

  if (!fileId) {
    return new Response(JSON.stringify({error: "File ID is required"}), {
      headers: {"Content-Type": "application/json"},
      status: 400,
    });
  }

  const fileMetadata = await getFileMetadataFromNeo4j(neo4jSession, fileId as string);

  if (!fileMetadata) {
    return new Response(JSON.stringify({error: "File not found"}), {
      headers: {"Content-Type": "application/json"},
      status: 404,
    });
  }

  // console.log(fileMetadata);

  try {
    const filePath = (fileMetadata.P.filepath);
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
  } catch (error) {
    console.log(error);
    return new Response(JSON.stringify({error: "Error reading file from disk"}), {
      headers: {"Content-Type": "application/json"},
      status: 500,
    });
  }
}