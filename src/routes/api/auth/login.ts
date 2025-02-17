import type { APIEvent } from "@solidjs/start/dist/server";
import type { Session } from "neo4j-driver";

import type { Vertex } from "~/lib/graph/graph";

import { SYSTEM_DB_NAME } from "~/cypher/boltConstant";
import { convertNodeToJson } from "~/cypher/convertNodeToJson";
import { getDriver } from "~/cypher/driver";
import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";
import { createActivityLog } from "~/cypher/mutate/activity/createActivityLog";
import { APIError, handleAPIError } from "~/lib/api/apiErrorHandler";
import { verifyPassword } from "~/lib/auth/password";
import { updateSession } from "~/server/session/updateSession";

import { updateRedirectUrl } from "./functions/updateRedirectUrl";

export async function POST({ request }: APIEvent) {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    throw new APIError("Invalid content type. Expected application/json", 415);
  }

  const { dbSession, subDomain } = await getDBSessionForSubdomain(request);

  try {
    const { email, password } = await request.json();

    if (!(email && password)) {
      throw new APIError("Email or password is missing", 400);
    }

    const user = await authenticateUser(email, password, subDomain, dbSession);
    await updateSession(user);

    await createActivityLog(
      dbSession,
      'login',
      'User',
      user.P.uuid,
      user.P.email,
      'User logged in successfully'
    );

    delete user.P.password;
    updateRedirectUrl(user, subDomain!);

    return user;
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}

async function authenticateSuperUser(superUser: Vertex, password: string) {
  const superDbSession = (await getDriver()).session({
    database: SYSTEM_DB_NAME,
  });

  try {
    const query = "MATCH (u:User) WHERE u.uuid = $uuid RETURN u";
    const superDbResult = await superDbSession.run(query, {
      uuid: superUser.P.uuid,
    });

    if (superDbResult.records.length === 0) {
      throw new Error(
        `Not Authorized Email or Username for UUID: ${superUser.P.uuid}. Please contact customer support.`,
      );
    }
    const user = convertNodeToJson(superDbResult.records[0].get("u"));
    return comparePassword(user, password);
  } finally {
    await superDbSession.close();
  }
}

async function authenticateUser(
  emailOrUsername: string,
  password: string,
  _subDomain: string,
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

    if (!user.P.emailConfirmed) {
      throw new Error("Please confirm your email address before logging in.");
    }

    // when system user, check password from system db
    if (user.P.isSuper) {
      return await authenticateSuperUser(user, password);
    }
    return comparePassword(user, password);
  } finally {
    await dbSession.close();
  }
}

async function comparePassword(user: Vertex, password: string) {
  const isValid = await verifyPassword(password, user.P.password, user.P.salt);
  if (!isValid) {
    throw new Error("Unauthorized: Incorrect email, username, or password.");
  }

  return user;
}
