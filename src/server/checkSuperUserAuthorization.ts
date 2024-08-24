import type { Session } from "neo4j-driver";

import { findUserByEmail } from "../cypher/mutate/user/findUserByEmail";
import { getUserEmailFromSession } from "./getUserEmailFromSession";

export async function checkSuperUserAuthorization(
  subDomain: string,
  dbSession: Session,
  isMutate = false,
) {
  return null;
  if (subDomain === "super") {
    const email = await getUserEmailFromSession();
    const { user } = await findUserByEmail(dbSession, email);
    if (user?.P.username !== "super") {
      return {
        error: `Not Authorized: Only super user can ${isMutate ? "mutate" : "get"} data in super subdomain.`,
      };
    }
  }
  return null;
}
