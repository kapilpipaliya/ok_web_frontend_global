import neo4j, { Driver } from 'neo4j-driver';

export async function connectToNeo4jWithRetry(
  uri: string,
  username: string,
  password: string,
  maxRetries: number = 5,
  initialDelay: number = 1000
): Promise<Driver> {
  let retries = 0;
  let delay = initialDelay;

  while (retries < maxRetries) {
    try {
      const driver = neo4j.driver(uri, undefined, {
        disableLosslessIntegers: true,
      });
      // Try to establish a connection by creating a session and running a simple query
      const session = driver.session();
      await session.run('RETURN 1');
      await session.close();

      console.log('Connected to Neo4j!');
      return driver;
    } catch (error) {
      console.error(`Failed to connect to Neo4j (attempt ${retries + 1}):`, error);
      retries += 1;
      if (retries >= maxRetries) {
        console.error('Max retries reached. Unable to connect to Neo4j.');
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, delay));
      // delay *= 2; // Exponential backoff
    }
  }

  throw new Error('Unable to connect to Neo4j after max retries.');
}

/*
// Usage example
(async () => {
  const uri = 'bolt://localhost:7687';
  const username = 'neo4j';
  const password = 'password';

  try {
    const driver = await connectToNeo4jWithRetry(uri, username, password);
    // Use the driver for database operations

    // Remember to close the driver when done
    await driver.close();
  } catch (error) {
    console.error('Connection to Neo4j failed:', error);
  }
})();
*/
