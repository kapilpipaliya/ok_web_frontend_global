import { connectToNeo4jWithRetry } from "~/cypher/connectToNeo4jWithRetry";
//import { createDockerContainer } from "~/server/docker/createDockerContainer";
import { executeDockerCompose } from "~/server/docker_compose/create";

export async function waitForDockerCreate(
  subdomain: string,
  driverPort: number,
  logsPort: number,
  labPort: number,
) {
  // Create Docker container with configured ports
  /*await createDockerContainer("memgraph/memgraph-platform", username, {
    [driverPort]: "7687",
    [labPort]: "3000",
    [logsPort]: "7444",
  });*/
  const dockerError = await executeDockerCompose(
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
  );
  // Remember to close the driver when done
  await driver.close();

  await new Promise((resolve, _reject) => setTimeout(resolve, 1000));
}
