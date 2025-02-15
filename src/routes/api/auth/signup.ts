import type { APIEvent } from "@solidjs/start/dist/server";
import type { Transaction } from "neo4j-driver";

import { SYSTEM_DB_NAME } from "~/cypher/boltConstant";
import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";
import { sendConfirmationEmail } from "~/lib/email/sendConfirmationEmail";
import { updateSession } from "~/server/session/updateSession";

import type { SignupRequestData } from "../../../cypher/mutate/signup/SignupRequestData";

import { signupAdmin } from "../../../cypher/mutate/signup/signupAdmin";
import { signupUser } from "../../../cypher/mutate/signup/signupUser";
import { updateRedirectUrl } from "./functions/updateRedirectUrl";

export async function POST({ request }: APIEvent) {
  if (request.headers.get("content-type")?.includes("application/json")) {
    const { dbSession, subDomain } = await getDBSessionForSubdomain(request);
    const data: SignupRequestData = await request.json();
    const tx = dbSession.beginTransaction();
    try {
      const user = await handleSignup(data, tx, subDomain);

      // Send confirmation email
      if (user?.id) {
        await sendConfirmationEmail(data.email, data.username, request);
      }

      return user;
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

async function handleSignup(
  data: SignupRequestData,
  tx: Transaction,
  subDomain: string,
) {
  try {
    let user;

    if (subDomain === SYSTEM_DB_NAME) {
      user = await signupAdmin(tx, data);
    } else {
      user = await signupUser(tx, data);
    }

    await tx.commit();
    await updateSession(user);
    delete user.P.password;
    updateRedirectUrl(user, subDomain);

    return user;
  } catch (error: any) {
    await tx.rollback();
    return new Response(error.message, { status: 500 });
  }
}
