import { auth, driver, type Driver } from "neo4j-driver";

export async function createDatabase(
  subdomain: string,
  driverPort: number,
  logsPort: number,
  labPort: number,
) {
  // Create Docker container with configured ports

  /*const dockerError = await executeDockerCompose(
    subdomain,
    driverPort,
    logsPort,
    labPort,
  );
  if (dockerError) {
    throw Error(dockerError);
  }

  const driver = await connectToNeo4jWithRetry(
    `bolt://localhost:${driverPort}`,
    "",
    "",
    20,
  );*/
  let neo4JDriver: Driver | undefined = undefined;
  try {
    // Create a new database with the subdomain name

    neo4JDriver = driver(
      `bolt://localhost:7687`,
      auth.basic("neo4j", "12345678")
    );
    const session = neo4JDriver.session();
    await session.run(`CREATE DATABASE ${subdomain}`);
    console.log(`Database ${subdomain} created successfully.`);
  } catch (error) {
    console.error(`Failed to create database ${subdomain}:`, error);
    throw error;
  } finally {
    // Remember to close the driver when done
    await neo4JDriver?.close();
  }

  await new Promise((resolve) => setTimeout(resolve, 1000));
}
