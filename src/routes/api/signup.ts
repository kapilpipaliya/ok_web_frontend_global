import type {APIEvent} from "@solidjs/start/dist/server";
import {getDriver} from "~/cypher/driver";
import {getSubDomain} from "~/server/getSubDomain";
import {convertNodeToJson} from "~/lib/convertNodeToJson";
import {getNewPortsForUser} from "~/routes/api/signup/getNewPortsForUser";
import {checkUserExistence} from "~/routes/api/signup/checkUserExistence";
import {waitForDockerCreate} from "~/routes/api/signup/waitForDockerCreate";
import {updatePortForNewUser} from "~/routes/api/signup/updatePortForNewUser";
import {createUserInDB} from "~/routes/api/signup/createUserInDB";
import {updateSession} from "~/routes/api/signup/updateSession";
import { syncNodesMGCall } from "~/cypher/mutate/sync";

async function signupAdmin(request: APIEvent["request"]) {
  const { username, email, password, subdomain } = await request.json();

  const session = (await getDriver("super")).session();
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
      "super",
      password,
      subdomain,
      driverPort,
      logsPort,
      labPort,
    );
    console.log("FetchCSVData");
    // todo run sync here
    syncNodesMGCall({
      userport: driverPort,
      nodesToTransfer: ["DataType", "CompCategory", "Comp", "Nav"]
    })

    // this should be in parent function
    const user = convertNodeToJson(createUserResult);

    await tx.commit();
    await session.close();
    console.log("updateSession", createUserResult);
    
    // Update session data with user's email
    await updateSession(user);

    const { password: _, ...P } = user.P;

    return {
      id: user.id,
      P
    };
  } catch (error: any) {
    console.error("Server error:", error.message, error);
    await session.close();
    return new Response(error.message, { status: 500 });
  } finally {
    await session.close();
  }
}
async function signupUser() {
  
}


// Define the POST function to handle user registration
export async function POST({ request }: APIEvent) {
  // Get subdomain from the request URL
  const subdomainFromUrl = await getSubDomain(
    request.headers.get("host")!,
    false,
  );
  console.log("subdomainFromUrl", subdomainFromUrl );
  
  if (subdomainFromUrl === "super") {
    return signupAdmin(request);
  } else {
    return signupUser();
  }
}

