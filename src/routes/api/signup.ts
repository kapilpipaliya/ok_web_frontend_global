// Import necessary modules and functions
import { APIEvent } from "@solidjs/start/dist/server";
import { TransactionPromise, Session } from "neo4j-driver-core";
import {
  getDriver,
  getDriverWithPort,
  isIntegerId,
} from "~/cypher_api/server/driver";
import { importAllCSV } from "~/cypher_api/pages/BackupRestore";
import { createDockerContainer } from "~/cypher_api/server/docker_functions";
import { getSubDomain } from "~/cypher_api/server/domain_utils";
import { getHttpsSession } from "~/cypher_api/server/auth/getHttpsSession";
import { checkPropertyExists } from "~/cypher_api/functions/db_functions";
import { getGraph } from "~/cypher_api/lib/graph";
import { v4 as uuidv4 } from 'uuid';

// Define the POST function to handle user registration
export async function POST({ request }: APIEvent) {
  const { username, email, password, subdomain } = await request.json();

  // Get subdomain from the request URL
  const subdomainFromUrl = getSubDomain(request.headers.get("host")!);
  const session = (await getDriver(subdomainFromUrl)).session();
  const tx = session.beginTransaction();

  try {
    // Check if the properties already exists
    await checkExistance(tx, username, email, subdomain);

    // Configure ports for the user's database
    const { driverPort, logsPort, labPort }: { [key: string]: any } =
      await PortConfigure(tx, username, subdomainFromUrl);

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

    const user = createUserResult.records[0].get("u");

    // Import CSV data to the user's database
    await FetchCSVData(user.properties.driverPort);

    await tx.commit();
    await session.close();

    // Update session data with user's email and subdomain
    await updateSession(createUserResult);

    const { password: _, ...properties } =
      createUserResult.records[0].get("u").properties;
    return {
      id: !isIntegerId
        ? createUserResult.records[0].get("u").identity.toNumber()
        : createUserResult.records[0].get("u").identity,
      properties,
    };
  } catch (error: any) {
    console.error("Server error:", error.message);
    await tx.rollback();
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
    email: createUserResult.records[0].get("u").properties.email,
    subdomain: createUserResult.records[0].get("u").properties.subdomain,
  }));
}

async function FetchCSVData(driverPort: any) {
  const [graph, setGraph] = getGraph();
  await importAllCSV(
    { driver: await getDriverWithPort(driverPort) },
    graph,
    setGraph,
  );
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
        }) RETURN u;`;
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
    console.log("super", createUserResult);

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
            }) RETURN u;`;
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

  return createUserResult;
}

// Function to configure ports for the user's database
async function PortConfigure(
  tx: TransactionPromise,
  username: string,
  subdomainFromUrl: string,
) {
  try {
    // Query to retrieve database port configuration
    const query = `MATCH (n:DBPort) RETURN n;`;
    const resultPort = await tx.run(query);
    let portsResult: any;

    if (resultPort.records.length === 0) {
      // Create default database port configuration if not exists
      const query = `CREATE (n:DBPort {driverPort: 1150, logsPort: 1151, labPort: 1152}) RETURN n;`;
      const resultPort = await tx.run(query);
      portsResult = resultPort.records[0].get("n").properties;
    } else {
      // if exists than return ports from db
      portsResult = resultPort.records[0].get("n").properties;
    }

    let { driverPort, logsPort, labPort } = portsResult;

    // Create Docker container with configured ports
    await createDockerContainer("memgraph/memgraph-platform", username, {
      [driverPort]: "7687",
      [logsPort]: "7444",
      [labPort]: "3000",
    });

    await new Promise((resolve, reject) => setTimeout(resolve,5000))

    // Update port configuration in the database
    const updatePort = `MATCH (n:DBPort) SET n.driverPort = ${driverPort + 10}, n.logsPort = ${logsPort + 10}, n.labPort = ${labPort + 10} RETURN n;`;
    await tx.run(updatePort);

    return { driverPort, logsPort, labPort };
  } catch (error: any) {
    console.log("DB Setup error:", error.stack);
    await tx.rollback();
    throw new Error(error.message);
  }
}

async function checkExistance(
  tx: TransactionPromise,
  username: string,
  email: string,
  subdomain: string,
) {
  // Check if the subdomain already exists
  if (
    subdomain &&
    (await checkPropertyExists("User", tx, "subdomain", subdomain))
  ) {
    throw new Error("Sub Domain already exists");
  }

  // Check if the username already exists
  if (
    username &&
    (await checkPropertyExists("User", tx, "username", username))
  ) {
    throw new Error("Username already exists");
  }

  // Check if the email already exists
  if (email && (await checkPropertyExists("User", tx, "email", email))) {
    throw new Error("Email address already exists");
  }
}
