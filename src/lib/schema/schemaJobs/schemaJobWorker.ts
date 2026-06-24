import type { Session } from "neo4j-driver";
import { join } from "node:path";

import { getDriver } from "~/cypher/core/driver";
import { createActivityLog } from "~/cypher/mutate/activity/createActivityLog";
import type { Vertex } from "~/lib/graph/type/vertex";
import { performSchemaImport } from "~/lib/schema/performSchemaImport";
import { performSchemaSync } from "~/lib/schema/performSchemaSync";
import { runMigration } from "~/lib/schema/runMigration";
import type {
  ExportJobPayload,
  SchemaJobQueueData,
} from "~/lib/schema/schemaJobs/schemaJobTypes";
import {
  parseExportQueryParams,
  performSchemaExport,
} from "~/routes/api/schema/export/performSchemaExport";

function syntheticWorkerUser(email: string, jobId: string): Vertex {
  return {
    id: `schema-job:${jobId}`,
    L: ["User"],
    IN: {},
    OUT: {},
    P: {
      email,
      uuid: `schema-job:${jobId}`,
    } as Vertex["P"] & { email: string; uuid: string },
  };
}

/**
 * Runs export/import/sync for one BullMQ job. Return value is stored as the job result; throws on failure.
 */
export async function executeSchemaQueueJob(
  data: SchemaJobQueueData,
  jobId: string,
): Promise<unknown> {
  const driver = await getDriver();
  const session = driver.session({ database: data.databaseName });
  const user = syntheticWorkerUser(data.userEmail || "system", jobId);

  try {
    if (data.operation === "export") {
      return await runExport(data.payload, session, data.subDomain, user);
    }
    if (data.operation === "import") {
      return await performSchemaImport({
        dbSession: session,
        subDomain: data.subDomain,
        user,
        filterOnly: data.payload.filterOnly,
        includeComponentKeys: data.payload.includeComponentKeys ?? [],
        includePageKeys: data.payload.includePageKeys ?? [],
        includeFunctionKeys: data.payload.includeFunctionKeys ?? [],
        currentShop: data.payload.currentShop ?? null,
      });
    }
    if (data.operation === "sync") {
      return await performSchemaSync({
        dbSession: session,
        subDomain: data.subDomain,
        user,
      });
    }
    if (data.operation === "migrate") {
      const migrationResult = await runMigration(
        session,
        data.subDomain,
        user,
        {
          dryRun: data.payload.dryRun,
          functionName: data.payload.functionName ?? undefined,
        },
      );
      if (!migrationResult.success) {
        throw new Error(
          migrationResult.error || `Migration failed for ${data.subDomain}`,
        );
      }
      return {
        success: true,
        message: `Migration completed${data.payload.dryRun ? " (dry run)" : ""}`,
        functionName: migrationResult.functionName,
        dryRun: migrationResult.dryRun,
        data: migrationResult.data,
      };
    }
    throw new Error(
      `Unknown operation: ${(data as { operation: string }).operation}`,
    );
  } finally {
    await session.close();
  }
}

async function runExport(
  payload: ExportJobPayload,
  session: Session,
  subDomain: string,
  user: Vertex,
): Promise<unknown> {
  const exportBasePath = join(process.cwd(), "src", "page_schema");
  const { stats, exportPath } = await performSchemaExport({
    dbSession: session,
    subDomain,
    exportBasePath,
    filterOnly: payload.filterOnly,
    includeComponentKeys: payload.includeComponentKeys ?? [],
    includePageKeys: payload.includePageKeys ?? [],
    includeFunctionKeys: payload.includeFunctionKeys ?? [],
  });

  const tx = session.beginTransaction();
  try {
    await createActivityLog(
      tx,
      "schema_export",
      "Schema",
      subDomain,
      user.P.email as string,
      payload.filterOnly
        ? `Exported selected components/pages/functions for subdomain ${subDomain}`
        : `Exported schema types for subdomain ${subDomain}`,
    );
    await tx.commit();
  } catch (e) {
    await tx.rollback();
    throw e;
  } finally {
    await tx.close();
  }

  return {
    success: true,
    message: payload.filterOnly
      ? "Export completed for selected Components, Pages, and/or Functions."
      : "Export completed for Components, Pages, Themes, Functions, and Email templates.",
    exportPath,
    details: stats,
  };
}

/** Build migrate job payload from request query string. */
export function buildMigrateJobPayload(request: Request): {
  dryRun: boolean;
  functionName: string | null;
} {
  const url = new URL(request.url);
  const dryRunParam = url.searchParams.get("dryRun");
  const functionName = url.searchParams.get("functionName")?.trim();
  return {
    dryRun: dryRunParam === "true" || dryRunParam === "1",
    functionName: functionName || null,
  };
}

/** Build export job payload from request query string. */
export function buildExportJobPayload(request: Request): ExportJobPayload {
  const q = parseExportQueryParams(request);
  return {
    filterOnly: q.filterOnly,
    includeComponentKeys: q.components,
    includePageKeys: q.pages,
    includeFunctionKeys: q.functions,
  };
}
