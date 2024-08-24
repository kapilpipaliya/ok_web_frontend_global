import type { APIEvent } from "@solidjs/start/dist/server";
import type { Transaction } from "neo4j-driver";

import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";
import { updateSession } from "~/cypher/mutate/signup/updateSession";

import type { SignupRequestData } from "../../../cypher/mutate/signup/SignupRequestData";

import { signupAdmin } from "../../../cypher/mutate/signup/signupAdmin";
import { signupUser } from "../../../cypher/mutate/signup/signupUser";

async function handleSignup(
  data: SignupRequestData,
  tx: Transaction,
  subdomain: string,
) {
  try {
    let user;

    if (subdomain === "super") {
      user = await signupAdmin(tx, data);
    } else {
      user = await signupUser(tx, data);
    }

    await tx.commit();
    await updateSession(user);
    delete user.P.password;

    return user;
  } catch (error: any) {
    await tx.rollback();
    return new Response(error.message, { status: 500 });
  }
}

export async function POST({ request }: APIEvent) {
  if (request.headers.get("content-type")?.includes("application/json")) {
    const { dbSession, subDomain } = await getDBSessionForSubdomain(request);
    const data: SignupRequestData = await request.json();
    const tx = dbSession.beginTransaction();
    try {
      return await handleSignup(data, tx, subDomain);
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
