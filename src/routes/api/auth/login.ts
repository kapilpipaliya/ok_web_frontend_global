import type { APIEvent } from "@solidjs/start/dist/server";
import type { Session } from "neo4j-driver";

import type { Vertex } from "~/lib/graph/graph";

import { convertNodeToJson } from "~/cypher/convertNodeToJson";
import { getDriverWithPort } from "~/cypher/driver";
import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";

import { updateSession } from "../../../cypher/mutate/signup/updateSession";

export async function POST({ request }: APIEvent) {
  const { email, password } = await request.json();
  const { dbSession, subDomain } = await getDBSessionForSubdomain(request);
  try {
    const user = await authenticateUser(email, password, subDomain, dbSession);

    await updateSession(user);

    delete user.P.password;
    if (subDomain === 'super' && user.P.username !== 'super') {
      user.P.redirectUrl = 'settings';
    }
    return user;
  } catch (error: unknown) {
    return new Response(error instanceof Error ? error.message : 'Unknown error', { status: 500 });
  } finally {
    await dbSession.close();
  }
}

async function authenticateUser(
  emailOrUsername: string,
  password: string,
  subDomain: string,
  dbSession: Session,
) {
  try {
    const query =
      "MATCH (u:User) WHERE u.email = $emailOrUsername OR u.username = $emailOrUsername RETURN u";
    const result = await dbSession.run(query, { emailOrUsername });

    if (result.records.length === 0) {
      throw new Error("Not Authorized Email or Username.");
    }

    const user = convertNodeToJson(result.records[0].get("u"));

    if (subDomain === "super") {
      return await authenticateSuperUser(user, password);
    }
    return authenticateRegularUser(user, password);
  } finally {
    await dbSession.close();
  }
}

function authenticateRegularUser(user: Vertex, password: string) {
  if (user.P.password !== password) {
    throw new Error("Unauthorized: Incorrect email, username, or password.");
  }

  return user;
}

async function authenticateSuperUser(
  superUser: Vertex,
  password: string,
) {
  const userDbSession = (
    await getDriverWithPort(superUser.P.driverPort)
  ).session();

  try {
    const query =
      "MATCH (u:User) WHERE u.uuid = $uuid RETURN u";
    const userDbResult = await userDbSession.run(query, { uuid: superUser.P.uuid });

    if (userDbResult.records.length === 0) {
      throw new Error("Not Authorized Email or Username.");
    }
    const user = convertNodeToJson(userDbResult.records[0].get("u"));
    return authenticateRegularUser(user, password);
  } finally {
    await userDbSession.close();
  }
}
