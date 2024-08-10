import type { APIEvent } from "@solidjs/start/dist/server";

import { getDriver } from "~/cypher/driver";
import { updateSession } from "~/cypher/mutate/signup/updateSession";
import { getSubDomain } from "~/server/getSubDomain";

import type { SignupRequestData } from "../../cypher/mutate/signup/SignupRequestData";

import { signupAdmin } from "../../cypher/mutate/signup/signupAdmin";
import { signupUser } from "../../cypher/mutate/signup/signupUser";



async function handleSignup(request: APIEvent["request"], subdomain: string) {
  const data: SignupRequestData = await request.json();

  const session = (await getDriver(subdomain)).session();
  const tx = session.beginTransaction();

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
    console.error("Server error:", error.message, error);
    await tx.rollback();
    return new Response(error.message, { status: 500 });
  } finally {
    await session.close();
  }
}

// Define the POST function to handle user registration
export async function POST({ request }: APIEvent) {
  const subdomain = await getSubDomain(request.headers.get("host")!);
  return handleSignup(request, subdomain);
}
