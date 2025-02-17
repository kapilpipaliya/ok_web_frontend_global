import type { APIEvent } from "@solidjs/start/dist/server";

import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";
import { APIError, handleAPIError } from "~/lib/api/apiErrorHandler";

import { updateProfile } from "./functions/updateProfile";

export async function POST({ request }: APIEvent) {
  const payload = await request.json();
  const { dbSession, subDomain } = await getDBSessionForSubdomain(request);

  try {
    if (!payload.uuid) {
      throw new APIError("UUID is required", 400);
    }
    
    const result = await updateProfile(payload, dbSession, subDomain);
    
    if ("error" in result) {
      throw new APIError(result.error, result.status || 500);
    }
    
    return result;
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
