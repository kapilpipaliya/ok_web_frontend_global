#!/usr/bin/env tsx
/**
 * Script to migrate existing settings to the unified Setting format
 *
 * Usage:
 *   npx tsx scripts/migrateSettings.ts [subdomain]
 *
 * Examples:
 *   npx tsx scripts/migrateSettings.ts admin
 *   npx tsx scripts/migrateSettings.ts mysubdomain
 */

import neo4j from "neo4j-driver";
import { migrateSettingsToUnifiedFormat } from "../src/cypher/migration/migrateSettingsToUnifiedFormat";

async function main() {
  const subdomain = process.argv[2] || "admin";

  console.log(`Migrating settings for subdomain: ${subdomain}`);
  console.log("==========================================\n");

  // Get database credentials from environment
  const uri = process.env.NEO4J_URI || "bolt://localhost:7687";
  const username = process.env.NEO4J_USERNAME || "neo4j";
  const password = process.env.NEO4J_PASSWORD || "password";
  const database = subdomain === "admin" ? "neo4j" : subdomain;

  // Create driver and session
  const driver = neo4j.driver(uri, neo4j.auth.basic(username, password));
  const session = driver.session({ database });

  try {
    // Run migration
    const result = await migrateSettingsToUnifiedFormat(session);

    console.log("\n==========================================");
    console.log("Migration completed successfully!");
    console.log("==========================================\n");

    return result;
  } catch (error) {
    console.error("\n==========================================");
    console.error("Migration failed!");
    console.error("==========================================\n");
    console.error(error);
    process.exit(1);
  } finally {
    await session.close();
    await driver.close();
  }
}

main();
