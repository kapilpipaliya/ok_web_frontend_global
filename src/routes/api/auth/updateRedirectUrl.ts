import type { Vertex } from "~/lib/graph/graph";

import { superUserData } from "../../../../tests/auth/data/signUpData";

export function updateRedirectUrl(user: Vertex, subDomain: string) {
  if (
    subDomain === superUserData.subDomain &&
    user.P.username !== superUserData.username
  ) {
    user.P.redirectUrl = "settings";
  }
}
