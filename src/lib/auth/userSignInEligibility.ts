import type { Vertex } from "~/lib/graph/type/vertex";

/** User vertex `P.status` from admin UI (e.g. UserManagement). */
export const USER_STATUS_INACTIVE = "inactive";

export const USER_DEACTIVATED_SIGN_IN_MESSAGE =
  "This account has been deactivated. Please contact your administrator.";

export function isUserInactiveForSignIn(user: Vertex | undefined): boolean {
  if (!user?.P) return false;
  return String(user.P.status ?? "").toLowerCase() === USER_STATUS_INACTIVE;
}
