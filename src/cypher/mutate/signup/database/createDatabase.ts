import { getDriver } from "~/cypher/core/driver";

export async function createDatabase(subdomain: string) {
  const neo4JDriver = await getDriver();
  const session = neo4JDriver.session();

  try {
    // Create a new database with the subdomain name
    await session.run(`CREATE DATABASE ${subdomain} IF NOT EXISTS`);
  } catch (error) {
    console.error(`Failed to create database ${subdomain}:`, error);
    throw error;
  } finally {
    // Close the session (NOT the driver - driver is a singleton!)
    await session.close();
  }

  await new Promise((resolve) => setTimeout(resolve, 1000));
}
