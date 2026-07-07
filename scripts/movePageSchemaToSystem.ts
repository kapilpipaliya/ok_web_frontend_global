#!/usr/bin/env npx tsx
/**
 * Moves schema files into a `system/` subdirectory within each schema type folder.
 *
 * Before: src/page_schema/default/components/forms/Button.hjson
 * After:  src/page_schema/default/components/system/forms/Button.hjson
 *
 * Applies to: components, pages, functions, themes, email_templates
 *
 * Usage:
 *   npx tsx scripts/movePageSchemaToSystem.ts
 *   npx tsx scripts/movePageSchemaToSystem.ts --execute
 *   npx tsx scripts/movePageSchemaToSystem.ts --execute --website default
 *   npx tsx scripts/movePageSchemaToSystem.ts --execute --website default,orvio
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PAGE_SCHEMA_ROOT = path.join(ROOT, "src/page_schema");
const SYSTEM_DIR = "system";

const SCHEMA_DIRS = [
  "components",
  "pages",
  "functions",
  "themes",
  "email_templates",
] as const;

/** Top-level page_schema entries that are not website directories. */
const SKIP_TOP_LEVEL = new Set([
  "loader.ts",
  "SERVER_FUNCTION_ARGS.md",
  "examples",
]);

const args = process.argv.slice(2);
const execute = args.includes("--execute");
const websiteArg = args.find((arg) => arg.startsWith("--website="))?.split("=")[1]
  ?? (args.includes("--website")
    ? args[args.indexOf("--website") + 1]
    : undefined);
const targetWebsites = websiteArg
  ? websiteArg.split(",").map((name) => name.trim()).filter(Boolean)
  : null;

function listWebsiteDirs(): string[] {
  return fs
    .readdirSync(PAGE_SCHEMA_ROOT, { withFileTypes: true })
    .filter(
      (entry) =>
        entry.isDirectory() &&
        !entry.name.startsWith(".") &&
        !SKIP_TOP_LEVEL.has(entry.name),
    )
    .map((entry) => entry.name)
    .sort();
}

function moveEntry(src: string, dest: string): void {
  if (!fs.existsSync(src)) return;

  if (!fs.existsSync(dest)) {
    if (execute) {
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.renameSync(src, dest);
    }
    console.log(
      `${execute ? "Moved" : "Would move"}: ${path.relative(ROOT, src)} -> ${path.relative(ROOT, dest)}`,
    );
    return;
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    moveEntry(path.join(src, entry.name), path.join(dest, entry.name));
  }

  if (execute && fs.readdirSync(src).length === 0) {
    fs.rmdirSync(src);
  }
}

function moveSchemaTypeContents(
  websiteDir: string,
  schemaDir: (typeof SCHEMA_DIRS)[number],
): void {
  const typeDir = path.join(websiteDir, schemaDir);
  if (!fs.existsSync(typeDir)) {
    return;
  }

  const systemDir = path.join(typeDir, SYSTEM_DIR);
  const entries = fs.readdirSync(typeDir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name === SYSTEM_DIR) {
      continue;
    }

    moveEntry(path.join(typeDir, entry.name), path.join(systemDir, entry.name));
  }
}

function migrateWebsite(websiteName: string): { moved: number; skipped: number } {
  const websiteDir = path.join(PAGE_SCHEMA_ROOT, websiteName);
  if (!fs.existsSync(websiteDir)) {
    console.error(`Website directory does not exist: ${websiteDir}`);
    return { moved: 0, skipped: 1 };
  }

  console.log(`\n=== ${websiteName} ===`);

  let moved = 0;
  let skipped = 0;

  for (const schemaDir of SCHEMA_DIRS) {
    const typeDir = path.join(websiteDir, schemaDir);
    if (!fs.existsSync(typeDir)) {
      skipped++;
      continue;
    }

    const hasMovableEntries = fs
      .readdirSync(typeDir, { withFileTypes: true })
      .some((entry) => entry.name !== SYSTEM_DIR);

    if (!hasMovableEntries) {
      skipped++;
      continue;
    }

    moveSchemaTypeContents(websiteDir, schemaDir);
    moved++;
  }

  return { moved, skipped };
}

function main(): void {
  if (!fs.existsSync(PAGE_SCHEMA_ROOT)) {
    console.error("page_schema directory does not exist:", PAGE_SCHEMA_ROOT);
    process.exit(1);
  }

  const websites = targetWebsites ?? listWebsiteDirs();

  if (websites.length === 0) {
    console.log("No website directories found.");
    return;
  }

  console.log(
    execute
      ? "Executing migration (files will be moved)."
      : "Dry run (pass --execute to move files).",
  );
  console.log("Websites:", websites.join(", "));

  let totalMoved = 0;
  let totalSkipped = 0;

  for (const websiteName of websites) {
    const { moved, skipped } = migrateWebsite(websiteName);
    totalMoved += moved;
    totalSkipped += skipped;
  }

  console.log(
    `\nDone. Schema type folders ${execute ? "processed" : "to process"}: ${totalMoved}, skipped/missing: ${totalSkipped}`,
  );

  if (!execute) {
    console.log("\nRe-run with --execute to apply changes.");
  }
}

main();
