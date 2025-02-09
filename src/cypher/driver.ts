import { auth, driver as createDriver } from "neo4j-driver";

import { boltPort } from "./boltConstant";

export async function getDriver() {
  return createDriver(
    `bolt://localhost:${boltPort}`,
    auth.basic("neo4j", "Kapil@1234"),
    { disableLosslessIntegers: true }, // undefined
  );
}
