/**
 * Schema import/export/sync operations for system Global Settings (admin subdomain).
 */

import { Job } from "bullmq";

import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { checkRole } from "~/cypher/permissions/isPermission";
import { SYSTEM_ROLES } from "~/cypher/permissions/type/types";
import type {
  ExportJobPayload,
  ImportJobPayload,
  SchemaJobQueueData,
} from "~/lib/schema/schemaJobs/schemaJobTypes";
import { isShopDatabaseName } from "~/lib/shopify/getDatabaseNameForShop";
import { getUserFromSession } from "~/server/auth/session/getUserFromSession";
import { getAllSubdomains } from "~/server/backup/backupManagement";
import { enqueueSchemaJob, schemaJobQueue } from "~/server/queue/schemaJobQueue";

export interface SchemaDatabaseInfo {
  name: string;
  address?: string;
  role?: string;
  currentStatus?: string;
}

export type SchemaDatabaseScope = "app" | "shop";

export type SchemaOperation = "export" | "import" | "sync";

export type SchemaJobUiStatus =
  | "queued"
  | "running"
  | "success"
  | "failed"
  | "enqueue_failed";

export interface SchemaJobStatusRow {
  databaseName: string;
  operation: SchemaOperation;
  jobId: string | null;
  status: SchemaJobUiStatus;
  error: string | null;
  result: unknown;
  startedAt: string | null;
  finishedAt: string | null;
}

const EXCLUDED_DATABASES = new Set(["system", "neo4j"]);

const DEFAULT_EXPORT_PAYLOAD: ExportJobPayload = {
  filterOnly: false,
  includeComponentKeys: [],
  includePageKeys: [],
  includeFunctionKeys: [],
};

const DEFAULT_IMPORT_PAYLOAD: ImportJobPayload = {
  filterOnly: false,
  includeComponentKeys: [],
  includePageKeys: [],
  includeFunctionKeys: [],
  currentShop: null,
};

function mapBullState(
  state: string,
): "queued" | "running" | "success" | "failed" {
  if (state === "waiting" || state === "delayed" || state === "paused") {
    return "queued";
  }
  if (state === "active") {
    return "running";
  }
  if (state === "completed") {
    return "success";
  }
  if (state === "failed") {
    return "failed";
  }
  return "queued";
}

async function assertAdminAccess() {
  const { dbSession, subDomain } = await getDBSessionForSubdomain();

  try {
    if (subDomain !== "admin") {
      return {
        ok: false as const,
        error: "This function is only accessible from the admin subdomain",
      };
    }

    const user = await getUserFromSession();
    if (!user) {
      return { ok: false as const, error: "Not signed in" };
    }

    const isAdmin = await checkRole(SYSTEM_ROLES.ADMIN, dbSession, user);
    if (!isAdmin) {
      return { ok: false as const, error: "Admin access required" };
    }

    return {
      ok: true as const,
      userEmail: String(user.P.email ?? ""),
    };
  } finally {
    await dbSession.close();
  }
}

function partitionDatabases(
  records: Array<{ name?: string; address?: string; role?: string; currentStatus?: string }>,
): { appDatabases: SchemaDatabaseInfo[]; shopDatabases: SchemaDatabaseInfo[] } {
  const appDatabases: SchemaDatabaseInfo[] = [];
  const shopDatabases: SchemaDatabaseInfo[] = [];

  for (const db of records) {
    const name = String(db.name ?? "").trim();
    if (name === "" || EXCLUDED_DATABASES.has(name)) {
      continue;
    }
    const row: SchemaDatabaseInfo = {
      name,
      address: db.address != null ? String(db.address) : undefined,
      role: db.role != null ? String(db.role) : undefined,
      currentStatus:
        db.currentStatus != null ? String(db.currentStatus) : undefined,
    };
    if (isShopDatabaseName(name)) {
      shopDatabases.push(row);
    } else {
      appDatabases.push(row);
    }
  }

  appDatabases.sort((a, b) => a.name.localeCompare(b.name));
  shopDatabases.sort((a, b) => a.name.localeCompare(b.name));

  return { appDatabases, shopDatabases };
}

/**
 * List Neo4j databases grouped into app/subdomain vs Shopify shop DBs.
 */
export async function listSchemaOperationDatabases(): Promise<
  | {
      success: true;
      data: {
        appDatabases: SchemaDatabaseInfo[];
        shopDatabases: SchemaDatabaseInfo[];
      };
    }
  | { success: false; error: string }
> {
  "use server";

  const access = await assertAdminAccess();
  if (!access.ok) {
    return { success: false, error: access.error };
  }

  const listed = await getAllSubdomains();
  if (!listed.success) {
    return { success: false, error: listed.error || "Failed to list databases" };
  }

  return {
    success: true,
    data: partitionDatabases(listed.data ?? []),
  };
}

async function resolveDatabaseNames(input: {
  databaseNames?: string[];
  scope?: SchemaDatabaseScope;
}): Promise<{ ok: true; names: string[] } | { ok: false; error: string }> {
  if (input.databaseNames && input.databaseNames.length > 0) {
    const names = input.databaseNames
      .map((n) => String(n).trim())
      .filter((n) => n !== "" && !EXCLUDED_DATABASES.has(n));
    if (names.length === 0) {
      return { ok: false, error: "No valid databases selected" };
    }
    if (input.scope === "app") {
      const appOnly = names.filter((n) => !isShopDatabaseName(n));
      if (appOnly.length === 0) {
        return { ok: false, error: "No app databases in selection" };
      }
      return { ok: true, names: appOnly };
    }
    if (input.scope === "shop") {
      const shopOnly = names.filter((n) => isShopDatabaseName(n));
      if (shopOnly.length === 0) {
        return { ok: false, error: "No shop databases in selection" };
      }
      return { ok: true, names: shopOnly };
    }
    return { ok: true, names };
  }

  const listed = await getAllSubdomains();
  if (!listed.success) {
    return { ok: false, error: listed.error || "Failed to list databases" };
  }

  const { appDatabases, shopDatabases } = partitionDatabases(listed.data ?? []);
  const names =
    input.scope === "shop"
      ? shopDatabases.map((db) => db.name)
      : input.scope === "app"
        ? appDatabases.map((db) => db.name)
        : [...appDatabases, ...shopDatabases].map((db) => db.name);

  if (names.length === 0) {
    return { ok: false, error: "No databases found" };
  }

  return { ok: true, names };
}

/**
 * Enqueue schema export/import/sync for one or all databases.
 */
export async function startSchemaOperations(input: {
  operation: SchemaOperation;
  databaseNames?: string[];
  scope?: SchemaDatabaseScope;
}): Promise<
  | { success: true; data: SchemaJobStatusRow[] }
  | { success: false; error: string }
> {
  "use server";

  const access = await assertAdminAccess();
  if (!access.ok) {
    return { success: false, error: access.error };
  }

  if (input.operation === "sync" && input.scope === "shop") {
    return {
      success: false,
      error:
        "Sync pushes app schema to shop databases. Run sync on an app/subdomain database instead.",
    };
  }

  const resolved = await resolveDatabaseNames({
    databaseNames: input.databaseNames,
    scope: input.scope,
  });
  if (!resolved.ok) {
    return { success: false, error: resolved.error };
  }

  const rows: SchemaJobStatusRow[] = [];

  for (const databaseName of resolved.names) {
    if (input.operation === "sync" && isShopDatabaseName(databaseName)) {
      rows.push({
        databaseName,
        operation: input.operation,
        jobId: null,
        status: "enqueue_failed",
        error:
          "Sync is only valid on app databases (exports app schema and updates linked shops).",
        result: null,
        startedAt: null,
        finishedAt: null,
      });
      continue;
    }
    const subDomain = databaseName;
    let enqueued:
      | { ok: true; jobId: string }
      | { ok: false; error: string };

    if (input.operation === "export") {
      enqueued = await enqueueSchemaJob({
        operation: "export",
        databaseName,
        subDomain,
        userEmail: access.userEmail,
        payload: DEFAULT_EXPORT_PAYLOAD,
      });
    } else if (input.operation === "import") {
      enqueued = await enqueueSchemaJob({
        operation: "import",
        databaseName,
        subDomain,
        userEmail: access.userEmail,
        payload: DEFAULT_IMPORT_PAYLOAD,
      });
    } else {
      enqueued = await enqueueSchemaJob({
        operation: "sync",
        databaseName,
        subDomain,
        userEmail: access.userEmail,
      });
    }

    if (!enqueued.ok) {
      rows.push({
        databaseName,
        operation: input.operation,
        jobId: null,
        status: "enqueue_failed",
        error: enqueued.error,
        result: null,
        startedAt: null,
        finishedAt: null,
      });
      continue;
    }

    rows.push({
      databaseName,
      operation: input.operation,
      jobId: enqueued.jobId,
      status: "queued",
      error: null,
      result: null,
      startedAt: null,
      finishedAt: null,
    });
  }

  return { success: true, data: rows };
}

/**
 * Poll BullMQ job status for a batch (admin subdomain only).
 */
export async function getSchemaOperationsStatus(input: {
  rows: Array<{
    databaseName: string;
    operation: SchemaOperation;
    jobId: string | null;
  }>;
}): Promise<
  | { success: true; data: SchemaJobStatusRow[] }
  | { success: false; error: string }
> {
  "use server";

  const access = await assertAdminAccess();
  if (!access.ok) {
    return { success: false, error: access.error };
  }

  const updated: SchemaJobStatusRow[] = [];

  for (const row of input.rows) {
    const databaseName = String(row.databaseName ?? "").trim();
    const operation = row.operation;
    const jobId = row.jobId != null ? String(row.jobId).trim() : "";

    if (!databaseName || !jobId) {
      updated.push({
        databaseName,
        operation,
        jobId: jobId || null,
        status: "enqueue_failed",
        error: "Missing job id",
        result: null,
        startedAt: null,
        finishedAt: null,
      });
      continue;
    }

    try {
      const job = await Job.fromId(schemaJobQueue, jobId);
      if (!job) {
        updated.push({
          databaseName,
          operation,
          jobId,
          status: "success",
          error: null,
          result: null,
          startedAt: null,
          finishedAt: null,
        });
        continue;
      }

      const data = job.data as SchemaJobQueueData;
      const bullState = await job.getState();
      const status = mapBullState(bullState);

      updated.push({
        databaseName,
        operation: data.operation ?? operation,
        jobId,
        status,
        error: status === "failed" ? job.failedReason ?? "Job failed" : null,
        result:
          status === "success" && job.returnvalue != null
            ? job.returnvalue
            : null,
        startedAt: job.processedOn
          ? new Date(job.processedOn).toISOString()
          : null,
        finishedAt: job.finishedOn
          ? new Date(job.finishedOn).toISOString()
          : null,
      });
    } catch (e) {
      updated.push({
        databaseName,
        operation,
        jobId,
        status: "failed",
        error: e instanceof Error ? e.message : String(e),
        result: null,
        startedAt: null,
        finishedAt: null,
      });
    }
  }

  return { success: true, data: updated };
}
