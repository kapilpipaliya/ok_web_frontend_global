import type { APIEvent } from "@solidjs/start/dist/server";

import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";

import { updateProfile } from "./functions/updateProfile";

export async function POST({ request }: APIEvent) {
  const payload = await request.json();
  const { dbSession, subDomain } = await getDBSessionForSubdomain(request);

  try {
    return await updateProfile(payload, dbSession, subDomain);
  } catch (error: any) {
    return new Response(error.message, { status: 500 });
  } finally {
    await dbSession.close();
  }
}
