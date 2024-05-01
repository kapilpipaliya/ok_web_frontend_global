import { Driver, driver as createDriver, auth } from "neo4j-driver";
import { createContext, createSignal } from "solid-js";
export const isIntegerId = true;

const drivers = {} as {[databaseId: string]: Driver};

export const LoadingContext = createContext(createSignal(false));

// Function to get a driver instance based on the database ID
export function getDriver(databaseId: string, port?: string | number, username?: string, password?: string) {
  if (!drivers[databaseId]) {
    drivers[databaseId] = createDriver(`bolt://localhost:${port || 1102}`, username && password ? auth.basic(username, password) : undefined, isIntegerId ? { disableLosslessIntegers: true } : undefined);
  }
  return drivers[databaseId];
}

