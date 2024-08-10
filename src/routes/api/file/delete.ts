import type {APIEvent} from "@solidjs/start/dist/server";
import type {HTTPEvent} from "vinxi/runtime/http-types";

import {getQuery} from "vinxi/http";

import {getSessionForSubdomain} from "~/cypher/get/getSessionForSubdomain";
import {deleteFile} from "~/server/upload/deleteFile";

export async function DELETE({ request }: APIEvent, event: HTTPEvent) {
  const query = getQuery(event);
  const fileId = query.fileId;

  if (!fileId) {
    return new Response(JSON.stringify({ error: "File ID is required" }), {
      headers: { "Content-Type": "application/json" },
      status: 400,
    });
  }

  const neo4jSession = await getSessionForSubdomain(request);

  try {
    return await deleteFile(fileId as string, neo4jSession);
  } finally {
    await neo4jSession.close();
  }
}

