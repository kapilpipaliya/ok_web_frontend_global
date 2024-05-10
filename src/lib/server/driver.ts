import { auth, driver as createDriver, Driver } from "neo4j-driver";

export const isIntegerId = true;

const drivers = {} as { [port: string]: Driver };

export async function getDriverWithPort(
  port: string | number,
  username?: string,
  password?: string,
) {
  if (!drivers[port]) {
    drivers[port] = createDriver(
      `bolt://localhost:${port}`,
      username && password ? auth.basic(username, password) : undefined,
      isIntegerId ? { disableLosslessIntegers: true } : undefined,
    );
  }
  return drivers[port];
}

const getSuperSession = async () => {
  return getDriverWithPort(1102);
}
// Function to get a driver instance based on the database ID
export async function getDriver(
  subdomain: string,
  username?: string,
  password?: string,
) {
  let port;
  if (subdomain === "super" || subdomain === "www") {
    port = 1102;
  } else {
    const session = await getSuperSession();
    const query = `MATCH (n:User {subdomain: '${subdomain}'}) RETURN n;`;
    const res = await session.run(query, { subdomain });
    if(res.records.length > 0){
      port = res.records[0].get('n')?.properties.driverPort;
    }else{
      throw new Error('Subdomain Not Found!')
    }
    session.close()
  }

  return getDriverWithPort(port, username, password);
}
