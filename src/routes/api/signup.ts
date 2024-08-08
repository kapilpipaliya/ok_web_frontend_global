import type { APIEvent } from "@solidjs/start/dist/server";

import { getDriver } from "~/cypher/driver";
import { syncNodesMGCall } from "~/cypher/mutate/sync";
import { checkUserExistence } from "~/routes/api/signup/checkUserExistence";
import {
  createUserInDB,
  createUserInUserDB,
} from "~/routes/api/signup/createUserInDB";
import { getNewPortsForUser } from "~/routes/api/signup/getNewPortsForUser";
import { updatePortForNewUser } from "~/routes/api/signup/updatePortForNewUser";
import { updateSession } from "~/routes/api/signup/updateSession";
import { waitForDockerCreate } from "~/routes/api/signup/waitForDockerCreate";
import { getSubDomain } from "~/server/getSubDomain";

import { createRootFolder } from "./signup/createRootFolder";

async function signupAdmin(request: APIEvent["request"]) {
  const { email, password, subdomain, username } = await request.json();

  const superSession = (await getDriver("super")).session();
  const tx = superSession.beginTransaction();
  try {
    // Check if the properties already exists
    await checkUserExistence(tx, username, email, subdomain);

    // Get ports for the user's database
    const { driverPort, labPort, logsPort }: { [key: string]: any } =
      await getNewPortsForUser(tx);

    await waitForDockerCreate(username, driverPort, logsPort, labPort);

    await updatePortForNewUser(tx, driverPort, logsPort, labPort);

    // Create a new user in the database according subdomain
    const user = await createUserInDB(
      tx,
      username,
      email,
      password,
      subdomain,
      driverPort,
      logsPort,
      labPort,
    );

    await createRootFolder(tx);
    syncNodesMGCall({
      nodesToTransfer: ["DataType", "CompCategory", "Comp"], //  "Nav"
      userport: driverPort,
    });

    await tx.commit();
    await superSession.close();

    // Update session data with user's email
    await updateSession(user);

    const { password: _, ...P } = user.P;

    return {
      id: user.id,
      P,
    };
  } catch (error: any) {
    console.error("Server error:", error.message, error);
    await superSession.close();
    return new Response(error.message, { status: 500 });
  } finally {
    await superSession.close();
  }
}

async function signupUser(request: APIEvent["request"]) {
  const { email, password, subdomain, username } = await request.json();
  const userSession = (await getDriver(subdomain)).session();
  try {
    // Check if the properties already exists
    await checkUserExistence(userSession, username, email, subdomain);

    const user = await createUserInUserDB(userSession, {
      email,
      password,
      uId: null,
      username,
    });

    await userSession.close();

    // Update session data with user's email
    await updateSession(user);

    delete user.P.password;

    return user;
  } catch (error: any) {
    console.error("Server error:", error.message, error);
    await userSession.close();
    return new Response(error.message, { status: 500 });
  } finally {
    await userSession.close();
  }
}

// Define the POST function to handle user registration
export async function POST({ request }: APIEvent) {
  // Get subdomain from the request URL
  const subdomainFromUrl = await getSubDomain(request.headers.get("host")!);

  if (subdomainFromUrl === "super") {
    return signupAdmin(request);
  }
  return signupUser(request);
}
