import type { APIEvent } from "@solidjs/start/server";

import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";
import { createActivityLog } from "~/cypher/mutate/activity/createActivityLog";
import { APIError, handleAPIError } from "~/lib/api/apiErrorHandler";
import { getUserFromSession } from "~/server/auth/session/getUserFromSession";
import { logout } from "~/server/auth/session/logout";

export async function POST({ request }: APIEvent) {
  try {
    // Get user before we log them out
    const user = await getUserFromSession(request);
    
    // If we have a user, log the logout activity
    if (user) {
      const { dbSession } = await getDBSessionForSubdomain(request);
      
      try {
        await createActivityLog(
          dbSession,
          "logout",
          "User",
          user.P.uuid,
          user.P.email,
          "User logged out"
        );
      } finally {
        await dbSession.close();
      }
    }
    
    // Complete the logout process
    await logout();
    
    return {
      message: "Logout successful",
    };
  } catch (_error) {
    return handleAPIError(new APIError("Failed to logout", 500));
  }
}
