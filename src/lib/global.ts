import { Driver, driver as createDriver, auth } from "neo4j-driver";
import { createContext, createSignal } from "solid-js";
export const isIntegerId = true;

const drivers = {} as { [port: string]: Driver };

export const LoadingContext = createContext(createSignal(false));

// Function to get a driver instance based on the database ID
export function getDriver(
  port: string | number,
  username?: string,
  password?: string,
) {
  if (port === "super") {
    port = 1102;
  }
  if (!drivers[port]) {
    // Check if docker is running and start it if not
    drivers[port] = createDriver(
      `bolt://localhost:${port}`,
      username && password ? auth.basic(username, password) : undefined,
      isIntegerId ? { disableLosslessIntegers: true } : undefined,
    );
  }
  return drivers[port];
}
