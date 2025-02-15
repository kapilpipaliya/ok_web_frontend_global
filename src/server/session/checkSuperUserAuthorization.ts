import type { Session } from "neo4j-driver";

import { SYSTEM_DB_NAME } from "~/cypher/boltConstant";

import { superUserData } from "../../../tests/auth/data/signUpData";
import { findUserByEmail } from "../../cypher/mutate/user/findUserByEmail";
import { getUserFromSession } from "./getUserFromSession";

export async function checkSuperUserAuthorization(
  subDomain: string,
  dbSession: Session,
  isMutate = false,
) {
  if (subDomain === SYSTEM_DB_NAME) {
    return null; // return null because now email is not required
    const sessionUser = await getUserFromSession();
    if (!sessionUser) {
      return {
        error: `Access Denied: You do not have permission to ${isMutate ? "make changes" : "view information"} in this area.`,
      };
    }
    
    const query = "MATCH (u:User {uuid: $uuid}) RETURN u";
    const result = await dbSession.run(query, { uuid: sessionUser!.P.uuid });
    const user = result.records[0]?.get('u')?.properties;
    
    if (user?.username !== superUserData.username) {
      return {
        error: `Access Denied: You do not have permission to ${isMutate ? "make changes" : "view information"} in this area.`,
      };
    }
  }
  return null;
}
