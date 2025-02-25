import type { APIEvent } from "@solidjs/start/server";
import type { Transaction } from "neo4j-driver";

import type { SignupRequestData } from "~/cypher/mutate/signup/SignupRequestData";

import { SYSTEM_DB_NAME } from "~/cypher/boltConstant";
import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";
import { signupAdmin } from "~/cypher/mutate/signup/signupAdmin";
import { signupUser } from "~/cypher/mutate/signup/signupUser";
import { APIError, handleAPIError } from "~/lib/api/apiErrorHandler";
import { sendConfirmationEmail } from "~/lib/email/sendConfirmationEmail";
import { sendNotificationEmail } from "~/lib/playwright/sendNotificationEmail";
import { updateSession } from "~/server/auth/session/updateSession";

import { updateRedirectUrl } from "../functions/updateRedirectUrl";
import {EMAIL_TEMPLATES} from "~/pages/settings/constants";

export async function POST({ request }: APIEvent) {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    throw new APIError("Invalid content type. Expected application/json", 415);
  }

  const { dbSession, subDomain } = await getDBSessionForSubdomain(request);
  const tx = dbSession.beginTransaction();

  try {
    const data: SignupRequestData = await request.json();
    const user = await handleSignup(data, tx, subDomain);

    if (user?.id) {
      // TODO: do not send duplicate email, use mhtml email only. TEST the confirmation email is working.
      await sendConfirmationEmail(data.email, data.username, request);
    }

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

    // Fire and forget the email sending process
    sendNotificationEmail(
      EMAIL_TEMPLATES.SIGNUP_CONFIRMATION,
      {},
      "Welcome to Our Platform - Please Confirm Your Email",
      user,
      subDomain,
    ).catch((error) => {
      console.error("Failed to send signup confirmation email:", error);
    });

    return user;
  } catch (error) {
    await tx.rollback();
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(errorMessage, { status: 500 });
  }
}
