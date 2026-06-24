import { writeFileSync } from "fs";
import { unlink } from "fs/promises";
import { join } from "path";
import Hjson from "hjson";
import { ensureDirectoryExists } from "~/lib/files/ensureDirectoryExists";
import { normalizeMultilineStrings } from "~/lib/hjson/normalizeMultilineStrings";
import type { ExportedSchema } from "~/routes/api/schema/ExportedSchema";
import { normalizeSchema } from "./normalizeSchema";
import { readdir } from "fs/promises";

export type ExportType =
  | "components"
  | "pages"
  | "themes"
  | "functions"
  | "email_templates";

// ---- NEW: recursively search for existing target file ----
async function findExistingSchemaFile(
  baseDir: string,
  key: string,
): Promise<string | null> {
  const files = await readdir(baseDir, { withFileTypes: true });

  for (const file of files) {
    const fullPath = join(baseDir, file.name);

    if (file.isDirectory()) {
      const found = await findExistingSchemaFile(fullPath, key);
      if (found) return found;
    } else if (file.isFile()) {
      if (file.name === `${key}.hjson`) {
        return fullPath; // Overwrite this file
      }
    }
  }
  return null;
}

export async function writeSchemaToFile(
  basePath: string,
  subdomain: string,
  type: ExportType,
  key: string,
  schema: ExportedSchema,
  categorySegments: string[] = [],
): Promise<void> {
  const typeDir = join(basePath, subdomain, type);
  await ensureDirectoryExists(typeDir);

  const targetDir =
    categorySegments.length > 0 ? join(typeDir, ...categorySegments) : typeDir;
  await ensureDirectoryExists(targetDir);

  const targetPath = join(targetDir, `${key}.hjson`);
  const existingPath = await findExistingSchemaFile(typeDir, key);

  writeFileSync(targetPath, generateHjson(schema), "utf8");

  if (existingPath && existingPath !== targetPath) {
    await unlink(existingPath);
  }
}

function generateHjson(schema: ExportedSchema): string {
  const normalizedSchema = normalizeSchema(schema);
  const hjsonContent = Hjson.stringify(normalizedSchema, {
    space: 2,
    bracesSameLine: true,
    multiline: "std",
    colors: false,
  });

  return normalizeMultilineStrings(hjsonContent);
}
