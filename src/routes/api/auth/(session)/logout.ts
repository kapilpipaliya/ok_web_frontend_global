import { APIError, handleAPIError } from "~/lib/api/apiErrorHandler";

import { logout } from "../../../../server/session/logout";

export async function POST() {
  try {
    await logout();
    return {
      message: "Logout successful",
    };
  } catch (_error) {
    return handleAPIError(new APIError("Failed to logout", 500));
  }
}
