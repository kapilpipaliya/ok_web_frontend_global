import type { APIEvent } from "@solidjs/start/dist/server";

import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";
import { updateProfile } from "~/routes/api/profile/updateProfile";

export async function POST({ request }: APIEvent) {
  const payload = await request.json();
  const { dbSession } = await getDBSessionForSubdomain(request);

  try {
    return await updateProfile(payload, dbSession);
  } catch (error: any) {
    return new Response(error.message, { status: 500 });
  } finally {
    await dbSession.close();
  }
}
