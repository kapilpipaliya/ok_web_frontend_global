import neo4j, {Driver, Session} from 'neo4j-driver';

export interface DBConnection {
  driver: Driver;
  session?: Session;
}

// Create an object to store Neo4j driver instances
const drivers = {} as {[databaseId: string]: Driver};

// Function to get a driver instance based on the database ID
export function getDriver(databaseId: string, uri: string, username?: string, password?: string) {
  
  
  if (!drivers[databaseId]) {
    drivers[databaseId] = neo4j.driver(uri, username && password ? neo4j.auth.basic(username, password) : undefined, { disableLosslessIntegers: true });
  }

  return drivers[databaseId];
}
