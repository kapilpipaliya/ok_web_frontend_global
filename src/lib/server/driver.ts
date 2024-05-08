import { auth, driver as createDriver, Driver } from "neo4j-driver";

export const isIntegerId = true;

const drivers = {} as { [port: string]: Driver };

// Function to get a driver instance based on the database ID
export async function getDriver(
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
