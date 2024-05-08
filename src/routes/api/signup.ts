import { APIEvent } from "@solidjs/start/dist/server";
import { Driver, Session } from "neo4j-driver";
import { TransactionPromise } from "neo4j-driver-core";
import { getDriver, isIntegerId } from "~/lib/global";
import { getSession } from "~/lib/auth/_server";
import { importAllCSV } from "~/cypher_api/pages/BackupRestore";
import { getGraph } from "~/cypher_api/lib/graph";
import postAPI from "~/lib/auth/PostApi";

// driverPort : 7687 -> For Driver // TODO : Last Digit 0
// Port3 : 3000 -> For Memgraph Lab // TODO : Last Digit 2

export async function POST({ request }: APIEvent) {
  const { username, email, password } = await request.json();
  const session = getDriver("super").session();
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

    const checkResult = await tx.run(
      `MATCH (u:User) WHERE u.email = $email RETURN u;`,
      { email: email },
    );
    if (checkResult.records.length > 0) {
      await tx.rollback();
      await session.close();
      return { error: "Email address already exists" };
    }

    const createUserQuery = `CREATE (u:User {username: $username, email: $email, password: $password}) RETURN u;`;
    const createUserResult = await tx.run(createUserQuery, {
      username,
      email,
      password,
    });

    const user = createUserResult.records[0].get("u");

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

    await tx.commit();
    await session.close();

    const http_session = await getSession();
    await http_session.update((oldData) => ({
      ...oldData,
      // userId: user.id,
      // username: user.username,
      // password: user.password,
      email: user.properties.email,
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
  await postAPI("http://easyformforge.com:5000/docker/createNew", {
    Image: "memgraph/memgraph-platform",
    name: username,
    portBindings: {
      [driverPort]: "7687",
      [logsPort]: "7444",
      [labPort]: "3000",
    },
  });

  // let userDriver: Driver;
  // if (!getDriver(username)) {
  let userDriver = getDriver(driverPort);
  // }
  await new Promise((resolve) => setTimeout(() => resolve(""), 15000));

  const [graph, setGraph] = getGraph();
  await importAllCSV({ driver: userDriver }, graph, setGraph);

  driverPort = driverPort + 10;
  logsPort = logsPort + 10;
  labPort = labPort + 10;
  const updatePort = `MATCH (n:DBPort) SET n.driverPort = ${driverPort}, n.logsPort = ${logsPort}, n.labPort = ${labPort} RETURN n;`;
  await tx.run(updatePort);
  return { driverPort, logsPort, labPort };
}
