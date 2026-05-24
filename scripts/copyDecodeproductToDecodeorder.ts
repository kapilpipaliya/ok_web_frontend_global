#!/usr/bin/env npx tsx
/**
 * Copies every file from src/page_schema/decodeproduct to multiple destination
 * directories (decodeorder, decodefile, etc.) with the same folder structure.
 * Skips:
 *   - Directories listed in SKIP_DIRS (and everything inside them)
 *   - Individual files listed in SKIP_FILES (paths relative to decodeproduct)
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SOURCE = path.join(ROOT, "src/page_schema/decodeproduct");

/** Destination directory names under src/page_schema (each gets a full copy). */
const DEST_NAMES = ["decodeorder", "decodefile", "extendfiles", "workshopflow", "hydrateme", "certpulse", "storetasks", "attendra", "ytorganizer"];

const SKIP_DIRS = [
  //"functions",
  //"pages",
  "functions/dynamic_page/shopify_hooks/category",
  "functions/dynamic_page/shopify_hooks/product",
  "functions/dynamic_page/shopify_hooks/menu",
  "functions/dynamic_page/shopify_jobs/product",
  "functions/dynamic_page/shopify_jobs/category",
  "functions/dynamic_page/shopify_jobs/menu",
  "pages/shopify/blog",
  "pages/shopify/product",
  "functions/dynamic_page/main_functions/migration",

  "components/portal",
  "functions/jobs",
  "pages/shopify/admin",
  "pages/portal",
  "functions/app",
  
];

/** Paths relative to decodeproduct – these files are not copied. */
const SKIP_FILES = [
  "functions/dynamic_page/shopify_jobs/product/processShopifyProductAfterUpdate.hjson",
  "components/shopify/ShopifyLayout.hjson",
  "components/shopify/ShopifyAuth.hjson",
  "components/shopify/ShopifyNavigation.hjson",
  "functions/dynamic_page/shopify_hooks/product/shopifyProductAfterCreateRelationship.hjson",
  "functions/dynamic_page/shopify_hooks/product/shopifyProductAfterMoveItemsToCategory.hjson",
  "functions/dynamic_page/shopify_hooks/product/shopifyProductBeforeFetchData.hjson",
  "functions/dynamic_page/shopify_jobs/product/processShopifyProductAfterCreateRelationship.hjson",
  "functions/dynamic_page/shopify_jobs/product/processShopifyProductAfterMoveItemsToCategory.hjson",
  "functions/shopify/fetchFirst25Products.hjson",
  "pages/shopify/DecodeProduct.hjson",
  "readme.md",


   "pages/shopify/support/ShopifySupport.hjson"
];

function shouldSkip(relativePath: string): boolean {
  const normalized = relativePath.split(path.sep).join("/");
  if (SKIP_FILES.includes(normalized)) return true;
  return SKIP_DIRS.some(
    (skip) => normalized === skip || normalized.startsWith(skip + "/")
  );
}

function* walkDir(dir: string, base = ""): Generator<string> {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const relativePath = base ? `${base}/${entry.name}` : entry.name;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walkDir(fullPath, relativePath);
    } else {
      yield relativePath;
    }
  }
}

function main() {
  if (!fs.existsSync(SOURCE)) {
    console.error("Source directory does not exist:", SOURCE);
    process.exit(1);
  }

  const destRoots = DEST_NAMES.map((name) =>
    path.join(ROOT, "src/page_schema", name)
  );

  let totalCopied = 0;
  let skipped = 0;
  const relativePaths = [...walkDir(SOURCE)];

  for (const relativePath of relativePaths) {
    if (shouldSkip(relativePath)) {
      skipped++;
      console.log("Skip:", relativePath);
      continue;
    }
    const srcFile = path.join(SOURCE, relativePath);
    for (const destRoot of destRoots) {
      const destFile = path.join(destRoot, relativePath);
      const destDir = path.dirname(destFile);
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }
      fs.copyFileSync(srcFile, destFile);
      totalCopied++;
      console.log("Copy:", relativePath, "->", path.relative(ROOT, destRoot));
    }
  }

  console.log(
    "\nDone. Total copies:",
    totalCopied,
    "Files skipped:",
    skipped,
    "Destinations:",
    DEST_NAMES.join(", ")
  );
}

main();
