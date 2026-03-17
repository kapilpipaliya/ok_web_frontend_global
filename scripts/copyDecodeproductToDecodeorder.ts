#!/usr/bin/env npx tsx
/**
 * Copies every file from src/page_schema/decodeproduct to src/page_schema/decodeorder
 * with the same folder structure.
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
const DEST = path.join(ROOT, "src/page_schema/decodeorder");

const SKIP_DIRS = [
  "functions/dynamic_page/shopify_hooks/category",
  "functions/dynamic_page/shopify_hooks/menu",
  "functions/dynamic_page/shopify_jobs/product",
  "functions/dynamic_page/shopify_jobs/category",
  "functions/dynamic_page/shopify_jobs/menu",
  "pages/shopify/blog",
  "pages/shopify/product",
];

/** Paths relative to decodeproduct – these files are not copied. */
const SKIP_FILES = [
  "functions/dynamic_page/shopify_jobs/product/processShopifyProductAfterUpdate.hjson",
  "components/shopify/ShopifyLayout.hjson",
  "functions/dynamic_page/shopify_hooks/product/shopifyProductAfterCreateRelationship.hjson",
  "functions/dynamic_page/shopify_hooks/product/shopifyProductAfterMoveItemsToCategory.hjson",
  "functions/dynamic_page/shopify_hooks/product/shopifyProductBeforeFetchData.hjson",
  "functions/dynamic_page/shopify_jobs/product/processShopifyProductAfterCreateRelationship.hjson",
  "functions/dynamic_page/shopify_jobs/product/processShopifyProductAfterMoveItemsToCategory.hjson",
  "functions/shopify/fetchFirst25Products.hjson",
  "pages/shopify/DecodeProduct.hjson",



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

  let copied = 0;
  let skipped = 0;

  for (const relativePath of walkDir(SOURCE)) {
    if (shouldSkip(relativePath)) {
      skipped++;
      console.log("Skip:", relativePath);
      continue;
    }
    const srcFile = path.join(SOURCE, relativePath);
    const destFile = path.join(DEST, relativePath);
    const destDir = path.dirname(destFile);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    fs.copyFileSync(srcFile, destFile);
    copied++;
    console.log("Copy:", relativePath);
  }

  console.log("\nDone. Copied:", copied, "Skipped:", skipped);
}

main();
