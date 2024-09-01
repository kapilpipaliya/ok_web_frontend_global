import type { Session } from "neo4j-driver";

import { superUserData } from "../../tests/auth/data/signUpData";
import { findUserByEmail } from "../cypher/mutate/user/findUserByEmail";
import { getUserEmailFromSession } from "./getUserEmailFromSession";

export async function checkSuperUserAuthorization(
  subDomain: string,
  dbSession: Session,
  isMutate = false,
) {
  if (subDomain === "super") {
    const email = await getUserEmailFromSession();
    if (!email) {
      return {
        error: `Access Denied: You do not have permission to ${isMutate ? "make changes" : "view information"} in this area.`,
      };
    }
    const { user } = await findUserByEmail(dbSession, email);
    if (user?.P.username !== superUserData.username) {
      return {
        error: `Access Denied: You do not have permission to ${isMutate ? "make changes" : "view information"} in this area.`,
      };
    }
  }
  return null;
}
