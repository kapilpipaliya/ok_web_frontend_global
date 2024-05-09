import { auth, driver as createDriver, Driver } from "neo4j-driver";

export const isIntegerId = true;

const drivers = {} as { [port: string]: Driver };

const getSuperSession = async () => {
  if (!drivers[1102]) {
    return createDriver(`bolt://localhost:1102`).session();
  }else{
    return drivers[1102].session();
  }
}
// Function to get a driver instance based on the database ID
export async function getDriver(
  subdomain: string,
  username?: string,
  password?: string,
) {
  let port;
  const session = await getSuperSession();
  if (subdomain === "super" || subdomain === "www") {
    port = 1102;
  } else {
    const query = `MATCH (n:User {subdomain: '${subdomain}'}) RETURN n;`;
    const res = await session.run(query, { subdomain });
    port = res.records[0].get('n')?.properties.driverPort;
    session.close()
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
