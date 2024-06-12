import type { Node } from "neo4j-driver";
import type { APIEvent } from "@solidjs/start/dist/server";
import type { TransactionPromise } from "neo4j-driver-core";
import { getDriver, getDriverWithPort } from "~/cypher/driver";
// import { importAllCSV } from "~/cypher/pages/BackupRestore";
import { createDockerContainer } from "~/server/docker_functions";
import { getSubDomain } from "~/server/domain_utils";
import { getHttpsSession } from "~/server/getHttpsSession";
import { v4 as uuidv4 } from "uuid";
import { findVertexesMGCall } from "~/cypher/get/findVertex";
import { convertNodeToJson } from "~/lib/convertNodeToJson";
import {connectToNeo4jWithRetry} from "~/cypher/retry";

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
    await checkExistence(tx, username, email, subdomain);

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

    // Import CSV data to the user's database
    await FetchCSVData(user.P.driverPort);

    await tx.commit();
    await session.close();
    console.log("updateSessio", createUserResult);
    
    // Update session data with user's email
    await updateSession(createUserResult);

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

async function updateSession(createUserResult: { [key: string]: any }) {
  const http_session = await getHttpsSession();
  await http_session.update((oldData) => ({
    ...oldData,
    email: createUserResult.properties.email,
    subdomain: createUserResult.properties.subdomain,
  }));
}

async function FetchCSVData(driverPort: any) {
  // const [graph, setGraph] = getGraph();
  // await importAllCSV(
  //   { driver: await getDriverWithPort(driverPort) },
  //   graph,
  //   setGraph,
  // );
}

async function createUserInDB(
  tx: TransactionPromise,
  username: any,
  email: any,
  subdomainFromUrl: string,
  password: any,
  subdomain: any,
  driverPort: any,
  logsPort: any,
  labPort: any,
) {
  const uId = uuidv4();
  let user;
  // Create user in a Main database without password
  const createUserQuery = `CREATE (u:User {
            username: $username,
            uId:$uId,
            email: $email,
            password: $password,
            subdomain: $subdomain,
            driverPort: $driverPort,
            logsPort: $logsPort,
            labPort: $labPort,
            profileImage: ''
        }) SET u.createdAt = localDateTime() RETURN u;`;
  const createUserResult = await tx.run(createUserQuery, {
    username,
    uId,
    email,
    password: subdomainFromUrl === "super" ? null : password,
    subdomain,
    driverPort,
    logsPort,
    labPort,
  });

  if (subdomainFromUrl === "super") {
    // Add user in a User database with password
    const session2 = (await getDriverWithPort(driverPort)).session();
    const createUserQuery2 = `CREATE (u:User {
                username: $username,
                uId:$uId,
                email: $email,
                password: $password,
                subdomain: $subdomain,
                driverPort: $driverPort,
                logsPort: $logsPort,
                labPort: $labPort,
                profileImage: ''
            }) SET u.createdAt = localDateTime() RETURN u;`;
    await session2.run(createUserQuery2, {
      username,
      uId,
      email,
      password,
      subdomain,
      driverPort,
      logsPort,
      labPort,
    });
    session2.close();
  }

  return createUserResult.records[0].get("u") as Node;
}

// Function to configure ports for the user's database
async function getNewPortsForUser(
  tx: TransactionPromise,
) {
    // Query to retrieve database port configuration
    const query = "MATCH (n:DBPort) RETURN n;";
    const resultPort = await tx.run(query);
    let portsResult: any;

    if (resultPort.records.length === 0) {
      // Create default database port configuration if not exists
      const query =
        "CREATE (n:DBPort {driverPort: 1150, logsPort: 1151, labPort: 1152}) SET n.createdAt = localDateTime() RETURN n;";
      const resultPort = await tx.run(query);

      const portResult = convertNodeToJson(resultPort.records[0].get("n"));
      portsResult = portResult.P;
    } else {
      // if exists than return ports from db
      const portResult = convertNodeToJson(resultPort.records[0].get("n"));
      portsResult = portResult.P;
    }

    return portsResult

}
async function waitForDockerCreate(username: string, driverPort: number, logsPort: number, labPort: number) {
  // Create Docker container with configured ports
  await createDockerContainer("memgraph/memgraph-platform", username, {
    [driverPort]: "7687",
    [logsPort]: "7444",
    [labPort]: "3000",
  });

  const driver = await connectToNeo4jWithRetry(`bolt://localhost:${driverPort}`, "", "", 20);
  // Remember to close the driver when done
  // driver.close();

  await new Promise((resolve, reject) => setTimeout(resolve, 1000));
}
async function updatePortForNewUser(  tx: TransactionPromise,
                            driverPort: number, logsPort: number, labPort: number) {
  // Update port configuration in the database for the new user
  const updatePort = `MATCH (n:DBPort) SET n.driverPort = ${
    driverPort + 10
  }, n.logsPort = ${logsPort + 10}, n.labPort = ${
    labPort + 10
  } SET n.updatedAt = localDateTime() RETURN n;`;
  await tx.run(updatePort);
}
async function checkExistence(
  tx: TransactionPromise,
  username: string,
  email: string,
  subdomain: string,
) {
  // Check if the subdomain already exists
  if (
    subdomain &&
    !(
      await findVertexesMGCall({
        label: "User",
        attribute: "subdomain",
        value: subdomain,
      })
    ).error
  ) {
    throw new Error("Sub Domain already exists");
  }

  // Check if the username already exists
  if (
    username &&
    !(
      await findVertexesMGCall({
        label: "User",
        attribute: "username",
        value: username,
      })
    ).error
  ) {
    throw new Error("Username already exists");
  }

  // Check if the email already exists
  if (
    email &&
    !(
      await findVertexesMGCall({
        label: "User",
        attribute: "email",
        value: email,
      })
    ).error
  ) {
    throw new Error("Email address already exists");
  }
}
