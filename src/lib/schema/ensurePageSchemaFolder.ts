import fs from "node:fs";
import path from "node:path";

const DEFAULT_WEBSITE = "default";

export function getPageSchemaRoot(): string {
  return path.join(process.cwd(), "src", "page_schema");
}

/**
 * Ensures a subdomain folder exists under src/page_schema.
 * If missing, copies the default website folder as a starting template.
 */
export function ensurePageSchemaFolderForSubdomain(subdomainKey: string): {
  created: boolean;
  copiedFrom?: string;
} {
  if (!subdomainKey || subdomainKey === DEFAULT_WEBSITE) {
    return { created: false };
  }

  const pageSchemaRoot = getPageSchemaRoot();

  if (!fs.existsSync(pageSchemaRoot)) {
    fs.mkdirSync(pageSchemaRoot, { recursive: true });
  }

  const subdomainDir = path.join(pageSchemaRoot, subdomainKey);
  if (fs.existsSync(subdomainDir)) {
    return { created: false };
  }

  const defaultDir = path.join(pageSchemaRoot, DEFAULT_WEBSITE);
  if (!fs.existsSync(defaultDir)) {
    console.warn(
      `[Page Schema] Default folder not found at ${defaultDir}, cannot copy for subdomain: ${subdomainKey}`,
    );
    return { created: false };
  }

  fs.cpSync(defaultDir, subdomainDir, { recursive: true });
  console.log(
    `[Page Schema] Created ${subdomainDir} by copying from ${DEFAULT_WEBSITE}`,
  );

  return { created: true, copiedFrom: DEFAULT_WEBSITE };
}
