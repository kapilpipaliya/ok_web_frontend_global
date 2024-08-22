import type {APIEvent} from "@solidjs/start/dist/server";
import type {HTTPEvent} from "vinxi/runtime/http-types";

import {readMultipartFormData} from "vinxi/http";

import {getDBSessionForSubdomain} from "~/cypher/get/getSessionForSubdomain";
import {replaceFiles} from "~/server/upload/replaceFiles";

export async function PUT({ request }: APIEvent, event: HTTPEvent) {
  const { dbSession , subDomain} = await getDBSessionForSubdomain(request);

  try {
    const data = await readMultipartFormData(event);

    if (!data || data.length === 0) {
      return { error: "No file data available" };
    }
    return await replaceFiles(request, data, dbSession, subDomain);
  } finally {
    await dbSession.close();
  }
}
