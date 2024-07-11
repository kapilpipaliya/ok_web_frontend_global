import type { TransactionPromise } from "neo4j-driver-core";

export async function updatePortForNewUser(
  tx: TransactionPromise,
  driverPort: number,
  logsPort: number,
  labPort: number,
) {
  // Update port configuration in the database for the new user
  const updatePort = `MATCH (n:DBPort) SET n.driverPort = ${
    driverPort + 10
  }, n.logsPort = ${logsPort + 10}, n.labPort = ${
    labPort + 10
  } SET n.updatedAt = localDateTime() RETURN n;`;
  await tx.run(updatePort);
}
