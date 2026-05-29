import type { Vertex } from "~/lib/graph/type/vertex";

import { APIError } from "~/lib/api/server/apiErrorHandler";
import { isShopDatabaseName } from "~/lib/shopify/getDatabaseNameForShop";

export const SYSTEM_USER_PASSWORD_CHANGE_MESSAGE =
  "Please change password through admin portal.";

export function isSystemDbUserWithoutLocalPassword(
  subDomain: string,
  password?: string | null,
): boolean {
  return !password && !isShopDatabaseName(subDomain);
}

export function assertUserCanChangePasswordLocally(
  user: Vertex | { password?: string | null },
  subDomain: string,
): void {
  const password =
    "P" in user && user.P ? user.P.password : (user as { password?: string | null }).password;

  if (isSystemDbUserWithoutLocalPassword(subDomain, password)) {
    throw new APIError(SYSTEM_USER_PASSWORD_CHANGE_MESSAGE, 403);
  }
}
