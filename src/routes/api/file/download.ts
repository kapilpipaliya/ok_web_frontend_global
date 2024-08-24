import type { APIEvent } from "@solidjs/start/dist/server";
import type { HTTPEvent } from "vinxi/runtime/http-types";

import { getQuery } from "vinxi/http";

import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";
import { downloadFile } from "~/server/upload/downloadFile";

export async function GET({ request }: APIEvent, event: HTTPEvent) {
  const query = getQuery(event);
  const fileId = query.fileId;
  const { dbSession } = await getDBSessionForSubdomain(request);

  if (!fileId) {
    return new Response(JSON.stringify({ error: "File ID is required" }), {
      headers: { "Content-Type": "application/json" },
      status: 400,
    });
  }

  try {
    return await downloadFile(fileId as string, dbSession);
  } finally {
    await dbSession.close();
  }
}
