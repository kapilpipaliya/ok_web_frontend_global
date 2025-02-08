import type { APIEvent } from "@solidjs/start/dist/server";
import type { Session } from "neo4j-driver";

import type { Vertex } from "~/lib/graph/graph";

import { SYSTEM_DB_NAME } from "~/cypher/boltConstant";
import { convertNodeToJson } from "~/cypher/convertNodeToJson";
import { getDriver } from "~/cypher/driver";
import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";

import { updateSession } from "../../../cypher/mutate/signup/updateSession";
import { updateRedirectUrl } from "./updateRedirectUrl";

export async function POST({ request }: APIEvent) {
  if (request.headers.get("content-type")?.includes("application/json")) {
    const body = await request.json();
    const { email, password } = body;

    if (!(email && password)) {
      return new Response(
        JSON.stringify({
          error: "Email or password is missing",
        }),
        { status: 400 },
      );
    }

    const { dbSession, subDomain } = await getDBSessionForSubdomain(request);
    try {
      const user = await authenticateUser(
        email,
        password,
        subDomain,
        dbSession,
      );

      await updateSession(user);

      delete user.P.password;
      updateRedirectUrl(user, subDomain);
      return user;
    } catch (error: unknown) {
      return new Response(
        error instanceof Error ? error.message : "Unknown error",
        { status: 500 },
      );
    } finally {
      await dbSession.close();
    }
  } else {
    return new Response(
      JSON.stringify({
        error: "Invalid content type. Expected application/json",
      }),
      { status: 415 },
    );
  }
}

async function authenticateSuperUser(superUser: Vertex, password: string) {
  const superDbSession = (await getDriver()).session({database: SYSTEM_DB_NAME});

  try {
    const query = "MATCH (u:User) WHERE u.uuid = $uuid RETURN u";
    const superDbResult = await superDbSession.run(query, {
      uuid: superUser.P.uuid,
    });

    if (superDbResult.records.length === 0) {
      throw new Error(`Not Authorized Email or Username for UUID: ${superUser.P.uuid}. Please contact customer support.`);
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

    // when system user, check password from system db
    if (user.P.isSuper) {
      return await authenticateSuperUser(user, password);
    }
    return comparePassword(user, password);
  } finally {
    await dbSession.close();
  }
}

function comparePassword(user: Vertex, password: string) {
  if (user.P.password !== password) {
    throw new Error("Unauthorized: Incorrect email, username, or password.");
  }

  return user;
}
