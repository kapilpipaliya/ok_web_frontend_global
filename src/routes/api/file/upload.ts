import type {APIEvent} from "@solidjs/start/dist/server";
import type {HTTPEvent} from "vinxi/runtime/http-types";

import {readMultipartFormData} from "vinxi/http";

import {getSessionForSubdomain} from "~/cypher/get/getSessionForSubdomain";
import {getSubDomain} from "~/server/getSubDomain";
import {uploadFiles} from "~/server/upload/uploadFile";

export async function POST({ request }: APIEvent, event: HTTPEvent) {
  const subdomain = await getSubDomain(request.headers.get("host")!);
  const neo4jSession = await getSessionForSubdomain(request);

  try {
    const data = await readMultipartFormData(event);
    if (!data || data.length === 0) {
      return { error: "No file data available" };
    }
    return await uploadFiles(data, subdomain, neo4jSession);
  } finally {
    neo4jSession.close();
  }
}
