import {createDockerContainer} from "~/server/docker/createDockerContainer";
import {connectToNeo4jWithRetry} from "~/cypher/retry";

export async function waitForDockerCreate(username: string, driverPort: number, logsPort: number, labPort: number) {
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