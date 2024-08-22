import type {APIEvent} from "@solidjs/start/dist/server";

import {getInitialData} from "~/cypher/get/getInitialData";
import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";

export async function GET({ request }: APIEvent) {
  const { dbSession } = await getDBSessionForSubdomain(request);

  try {
    const data = await getInitialData(dbSession);
    return data;
  } catch (error: any) {
    return new Response(`Internal Server Error: ${error.message}`, { status: 500 });
  } finally {
    await dbSession.close();
  }
}
