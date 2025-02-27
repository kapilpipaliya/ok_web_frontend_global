import type { APIEvent } from "@solidjs/start/server";
import type { Transaction } from "neo4j-driver";

import type { SignupRequestData } from "~/cypher/mutate/signup/SignupRequestData";

import { SYSTEM_DB_NAME } from "~/cypher/boltConstant";
import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";
import { signupAdmin } from "~/cypher/mutate/signup/signupAdmin";
import { signupUser } from "~/cypher/mutate/signup/signupUser";
import { handleAPIError } from "~/lib/api/apiErrorHandler";
import { sendNotificationEmail } from "~/lib/playwright/sendNotificationEmail";
import { EMAIL_TEMPLATES } from "~/pages/settings/constants";
import { sendEmailVerification } from "~/routes/api/auth/(profile)/functions/sendEmailVerification";
import { updateRedirectUrl } from "~/routes/api/auth/(user)/functions/updateRedirectUrl";
import { updateSession } from "~/server/auth/session/updateSession";

export async function POST({ request }: APIEvent) {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return { error: "Invalid content type. Expected application/json", success: false };
  }

  const { dbSession, subDomain } = await getDBSessionForSubdomain(request);
  const tx = dbSession.beginTransaction();

  try {
    const data: SignupRequestData = await request.json();
    const user = await handleSignup(request, data, tx, subDomain);
    await tx.commit();
    return user;
  } catch (error) {
    await tx.rollback();
    return handleAPIError(error);
  } finally {
    await tx.close();
    await dbSession.close();
  }
}

async function handleSignup(
  request: APIEvent["request"],
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

    if (!("id" in user)) {
      throw new Error("User creation failed");
    }

    await tx.commit();
    await updateSession(user);
    delete user.P.password;
    updateRedirectUrl(user, subDomain);

    // Welcome email
    sendNotificationEmail(
      EMAIL_TEMPLATES.WelcomeEmail,
      {},
      "Welcome to Our Platform",
      user,
      subDomain,
    );
    
    // by default, emailVerified is false
    // Send email verification
    sendEmailVerification(
      request,
      tx,
      user, 
      subDomain
    );

    return {
      graph: {
        edges: {},
        vertexes: { [user.id]: user },
      },
      result: user,
    };
  } catch (error) {
    await tx.rollback();
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(errorMessage, { status: 500 });
  }
}
