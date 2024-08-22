import type { Transaction } from "neo4j-driver";


export async function updatePortForNewUser(
  tx: Transaction,
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
