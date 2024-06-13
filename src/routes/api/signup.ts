import type {APIEvent} from "@solidjs/start/dist/server";
import {getDriver} from "~/cypher/driver";
import {getSubDomain} from "~/server/domain_utils";
import {convertNodeToJson} from "~/lib/convertNodeToJson";
import {getNewPortsForUser} from "~/routes/api/signup/getNewPortsForUser";
import {checkUserExistence} from "~/routes/api/signup/checkUserExistence";
import {waitForDockerCreate} from "~/routes/api/signup/waitForDockerCreate";
import {updatePortForNewUser} from "~/routes/api/signup/updatePortForNewUser";
import {createUserInDB} from "~/routes/api/signup/createUserInDB";
import {updateSession} from "~/routes/api/signup/updateSession";

// Define the POST function to handle user registration
export async function POST({ request }: APIEvent) {
  const { username, email, password, subdomain } = await request.json();

  // Get subdomain from the request URL
  const subdomainFromUrl = await getSubDomain(
    request.headers.get("host")!,
    false,
  );
  const session = (await getDriver(subdomainFromUrl)).session();
  const tx = session.beginTransaction();

  try {
    // Check if the properties already exists
    await checkUserExistence(tx, username, email, subdomain);

    // Get ports for the user's database
    const { driverPort, logsPort, labPort }: { [key: string]: any } =
      await getNewPortsForUser(tx);

    await waitForDockerCreate(username, driverPort, logsPort, labPort);

    await updatePortForNewUser(tx, driverPort, logsPort, labPort);

    // Create a new user in the database according subdomain
    const createUserResult = await createUserInDB(
      tx,
      username,
      email,
      subdomainFromUrl,
      password,
      subdomain,
      driverPort,
      logsPort,
      labPort,
    );
    console.log("FetchCSVData");

    const user = convertNodeToJson(createUserResult);

    await tx.commit();
    await session.close();
    console.log("updateSession", createUserResult);
    
    // Update session data with user's email
    await updateSession(user);

    const { password: _, ...properties } = user.P;

    return {
      id: user.id,
      properties: user.P,
    };
  } catch (error: any) {
    console.error("Server error:", error.message, error);
    await session.close();
    return new Response(error.message, { status: 500 });
  } finally {
    await session.close();
  }
}

