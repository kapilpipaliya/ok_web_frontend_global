#!/usr/bin/env node

/**
 * Script to migrate from Master CSS to direct CSS-in-JS
 *
 * Usage: node scripts/run-migration.js [target-directory]
 * Example: node scripts/run-migration.js src/pages/auth
 */

import { execSync } from "child_process";
import fs from "fs";

// Default to src if no directory is provided
const targetDir = process.argv[2] || "src";

// Check if the directory exists
if (!fs.existsSync(targetDir)) {
  console.error(`Error: Directory '${targetDir}' does not exist`);
  process.exit(1);
}

console.log(
  `\n🚀 Starting migration from Master CSS to CSS-in-JS in ${targetDir}\n`,
);

try {
  // Run the migration script
  execSync(`node scripts/migrate-from-master-css.js ${targetDir}`, {
    stdio: "inherit",
    cwd: process.cwd(),
  });

  console.log("\n✅ Migration completed successfully!");
  console.log("\n📋 Next steps:");
  console.log("1. Run your tests to ensure everything works correctly");
  console.log(
    "2. Fix any styling issues that may have occurred during the migration",
  );
  console.log(
    "3. Remove Master CSS dependencies with: npm uninstall @master/css @master/css-runtime @master/css-server @master/eslint-plugin-css\n",
  );
} catch (error) {
  console.error("\n❌ Migration failed:", error.message);
  process.exit(1);
}
