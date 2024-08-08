// Function to configure ports for the user's database
import type { TransactionPromise } from "neo4j-driver-core";

import { convertNodeToJson } from "~/cypher/convertNodeToJson";

export async function getNewPortsForUser(tx: TransactionPromise) {
  // Query to retrieve database port configuration
  const query = "MATCH (n:DBPort) RETURN n;";
  const resultPort = await tx.run(query);

  if (resultPort.records.length === 0) {
    // Create default database port configuration if not exists
    const createQuery =
      "CREATE (n:DBPort {driverPort: 1150, logsPort: 1151, labPort: 1152}) SET n.createdAt = localDateTime() RETURN n;";
    const createResult = await tx.run(createQuery);

    const portResult = convertNodeToJson(createResult.records[0].get("n"));
    return portResult.P;
  }
    // if exists than return ports from db
    const portResult = convertNodeToJson(resultPort.records[0].get("n"));
    return portResult.P;
}
