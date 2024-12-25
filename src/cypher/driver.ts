import { auth, driver as createDriver } from "neo4j-driver";

import { boltPort } from "./boltConstant";

export async function getDriver() {
  return createDriver(
    `bolt://localhost:${boltPort}`,
     auth.basic("neo4j", "12345678"),
    { disableLosslessIntegers: true }, // undefined
  );
}
