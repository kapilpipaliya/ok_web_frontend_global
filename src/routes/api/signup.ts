import { APIEvent } from "@solidjs/start/dist/server";
import { TransactionPromise } from "neo4j-driver-core";
import { getDriver, isIntegerId } from "~/lib/server/driver";
import { getHttpsSession } from "~/lib/auth/_server";
import { importAllCSV } from "~/cypher_api/pages/BackupRestore";
import { getGraph } from "~/cypher_api/lib/graph";
import { checkPropertyExists } from "~/lib/server/functions";
import { createDockerContainer } from "~/lib/server/docker_functions";
import { getSubDomain } from "~/lib/server/domain_utils";

// driverPort : 7687 -> For Driver // TODO : Last Digit 0
// Port3 : 3000 -> For Memgraph Lab // TODO : Last Digit 2

export async function POST({ request }: APIEvent) {
  const { username, email, password, subdomain } = await request.json();
  const subdomainFromUrl = getSubDomain(request.headers.get("host")!);
  const session = (await getDriver(subdomainFromUrl)).session();
  const tx = session.beginTransaction();

  try {
    const checkResultUsername = await tx.run(
      `MATCH (u:User) WHERE u.username = $username RETURN u;`,
      { username },
    );
    if (checkResultUsername.records.length > 0) {
      await tx.rollback();
      await session.close();
      return { error: "Username already exists" };
    }

    if (email && (await checkPropertyExists("User", tx, "email", email))) {
      await tx.rollback();
      await session.close();
      return { error: "Email address already exists" };
    }

    if (
      subdomain &&
      (await checkPropertyExists("User", tx, "subdomain", subdomain))
    ) {
      await tx.rollback();
      await session.close();
      return { error: "Sub Domain already exists" };
    }

    let driverPort, logsPort, labPort;
    try {
      const portResult = await PortConfigure(tx, username);
      driverPort = portResult.driverPort;
      logsPort = portResult.logsPort;
      labPort = portResult.labPort;
    } catch (error: any) {
      console.error("DB Setup error:", error.message);
      await tx.rollback();
      await session.close();
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
    const createUserQuery = `CREATE (u:User {
      username: $username,
      email: $email,
      password: $password,
      subdomain: $subdomain,
      driverPort: $driverPort,
      logsPort: $logsPort,
      labPort: $labPort
    }) RETURN u;`;
    const createUserResult = await tx.run(createUserQuery, {
      username,
      email,
      password,
      subdomain,
      driverPort,
      logsPort,
      labPort,
    });

    const user = createUserResult.records[0].get("u");
    await tx.commit();
    await session.close();

    const http_session = await getHttpsSession();
    await http_session.update((oldData) => ({
      ...oldData,
      email: user.properties.email,
      subdomain: user.properties.subdomain,
    }));
    const { password: _, ...properties } = user.properties;
    return {
      id: !isIntegerId ? user.identity.toNumber() : user.identity,
      properties,
    };
  } catch (error: any) {
    console.error("Server error:", error.message);
    await tx.rollback();
    await session.close();
    return new Response(error.message, { status: 500 });
  }
}

async function PortConfigure(tx: TransactionPromise, username: string) {
  const query = `MATCH (n:DBPort) RETURN n;`;
  const resultPort = await tx.run(query);
  let portsResult: any;
  if (resultPort.records.length === 0) {
    const query = `CREATE (n:DBPort {driverPort: 1150, logsPort: 1151, labPort: 1152}) RETURN n;`;
    const resultPort = await tx.run(query);
    portsResult = resultPort.records[0].get("n").properties;
  } else {
    portsResult = resultPort.records[0].get("n").properties;
  }
  let { driverPort, logsPort, labPort } = portsResult;

  // TODO: use this function in solid start and use it.
  await createDockerContainer("memgraph/memgraph-platform", username, {
    [driverPort]: "7687",
    [logsPort]: "7444",
    [labPort]: "3000",
  });

  // let userDriver: Driver;
  // if (!getDriver(username)) {
  let userDriver = await getDriver(driverPort);
  // }
  await new Promise((resolve) => setTimeout(() => resolve(""), 15000));

  const [graph, setGraph] = getGraph();
  await importAllCSV({ driver: userDriver }, graph, setGraph);
  const updatePort = `MATCH (n:DBPort) SET n.driverPort = ${driverPort + 10}, n.logsPort = ${logsPort + 10}, n.labPort = ${labPort + 10} RETURN n;`;
  await tx.run(updatePort);
  return { driverPort, logsPort, labPort };
}
