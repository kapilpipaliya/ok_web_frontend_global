# Schema import, export, and sync

This document describes how **export**, **import**, and **sync** work for page schema (components, pages, themes, functions, email templates) in the admin tooling.

Jobs are **asynchronous**: the HTTP handler enqueues work on **BullMQ** (`schema-jobs` queue). A platform worker consumes the queue and runs the same core functions used by the synchronous paths. Job status and results are read from **Redis** via BullMQ (there is no `SchemaJob` vertex in Neo4j).

---

## End-to-end flow

1. **Start a job** — `GET` one of:
   - `/api/schema/export`
   - `/api/schema/import`
   - `/api/schema/sync`  
   The request must be authenticated and authorized like other schema admin APIs. The response is **202** with `{ jobId, status: "queued", operation }` when Redis accepts the job.

2. **Poll status** — `GET /api/schema/jobs/:jobId`  
   `jobId` is the stable BullMQ job id returned by step 1: `run-schema-job-{safeDatabase}-{operation}` (one non-terminal job per database + operation; a new run is only enqueued after the previous job has finished and been removed from Redis, or its record is cleared before re-queue).

3. **Workers** — After **Redis** is available, `initWorkersCore` starts the **schema jobs queue worker** (alongside the email worker). If Redis is down at enqueue time, the API returns **503** with an error message.

4. **Retention** — Completed/failed jobs follow BullMQ `removeOnComplete` / `removeOnFail` settings in `src/server/queue/redisConfig.ts`. After Redis drops a job, `GET /api/schema/jobs/:jobId` may return **404** (“not found or no longer in Redis”).

---

## Export

**Route:** `src/routes/api/schema/export.ts`  
**Queue payload:** `operation: "export"` plus `databaseName`, `subDomain`, `userEmail`, and `ExportJobPayload`.

**Payload from the request** (`buildExportJobPayload` in `src/lib/schema/schemaJobs/schemaJobWorker.ts`):

- Query params are parsed via `parseExportQueryParams` (see `src/routes/api/schema/export/performSchemaExport.ts`).
- **`filterOnly`** becomes true when the client passes any of: `components`, `pages`, or `functions` (comma-separated keys). Otherwise the export is **full** (all relevant schema types for the site).

**Execution** (`performSchemaExport` in `src/routes/api/schema/export/performSchemaExport.ts`):

- Reads **Component**, **Page**, **Theme**, **Function**, and **EmailTemplate** data from the **current subdomain’s Neo4j database** (`dbSession`).
- When `filterOnly` is true, only the listed keys are exported; otherwise everything (subject to normal skip rules inside the exporter).
- Writes **`.hjson`** (and related) files under `exportBasePath` — for background jobs this is `src/page_schema` (see `runExport` in `schemaJobWorker.ts`).
- Returns **statistics** (counts, keys) and the **export directory path**.

**After export:** an activity log entry is written (`schema_export` / `Schema`) for the initiating user.

---

## Import

**Route:** `src/routes/api/schema/import.ts`  
**Queue payload:** `operation: "import"` plus `databaseName`, `subDomain`, `userEmail`, and `ImportJobPayload`.

**Payload from the request** (`buildImportJobPayload` in `src/lib/schema/performSchemaImport.ts`):

- Same idea as export: `components`, `pages`, `functions` query params → optional **filter-only** import.
- **`shop`** query param → `currentShop` (optional). If set and looks like `*.myshopify.com`, post-import logic can run **shop-specific database migration** (`ensureShopDatabaseAndMigrate`).

**Execution** (`performSchemaImport` in `src/lib/schema/performSchemaImport.ts`):

1. Loads **website schemas from disk** with `getWebsiteSchemasSync(websiteName)` where `websiteName` is the **subdomain** key (same as the filesystem layout under `src/page_schema/<websiteName>/`).
2. If `filterOnly`, restricts loaded schemas to the requested component/page/function keys.
3. In a **transaction**: deletes overlapping existing graph content where needed (`deleteExistingItems`), **imports** vertices/edges (`importSchemas`), writes an **import activity log**, then commits.
4. Runs **`runMigration`** on the main subdomain database (non–dry-run).
5. Calls **`saveMigrationRequestForAllShops`**.
6. Optionally migrates the **current shop** database when `currentShop` is provided.

The JSON **result** returned to the client (via Bull `returnvalue`) matches the legacy success shape from `buildSuccessResponse`, optionally augmented with a **`migration`** summary.

---

## Sync

**Route:** `src/routes/api/schema/sync.ts`  
**Queue payload:** `operation: "sync"` with `databaseName`, `subDomain`, and `userEmail` (no separate payload object).

**Purpose:** Push the **main app subdomain’s** schema from Neo4j into **every Shopify shop database** registered for that domain, then run migrations per shop. This is the “multi-tenant copy” path.

**Execution** (`performSchemaSync` in `src/lib/schema/performSchemaSync.ts`):

1. Creates a **temporary directory** under the OS temp folder.
2. **Exports** the full subdomain schema into that directory (`performSchemaExport` with `filterOnly: false` and `exportBasePath` = temp dir).
3. Queries **`ShopifyShop`** nodes on the main `dbSession` for distinct `shop` values.
4. For each shop:
   - Sets `ShopifyShop.syncStatus` to `running`, then on success/failure updates **`syncStatus`** and **`lastSynced`** (`updateShopifyShopSyncFields`).
   - Ensures the **shop database** exists (`createDatabase` / tolerate already exists).
   - Opens a session for that shop DB, loads schemas from the **temp export** via `loadWebsiteSchemasFromDirectory`, then in a transaction: **`deleteExistingItems`**, **`importSchemas`**, **`createSchemaImportActivityLog`**, commit.
   - Runs **`runMigration`** for that shop database with `contextData: { shop }` and `appSubDomain: subDomain`.
5. Calls **`saveMigrationRequestForAllShops`**.
6. Writes a **`schema_sync`** activity log on the main subdomain.
7. Deletes the temp directory.

The **result** object includes `success`, `message`, `exportPath`, `exportDetails`, and a **`shops`** array (per-shop success, errors, import counts, migration info).

---

## Key source files

| Concern | Location |
|--------|----------|
| Bull queue + enqueue + job id (`run-schema-job-…`) | `src/server/queue/schemaJobQueue.ts` |
| Worker process function | `src/server/queue/workers/schemaJobsQueueWorker.ts` |
| Dispatch export / import / sync | `src/lib/schema/schemaJobs/schemaJobWorker.ts` (`executeSchemaQueueJob`) |
| Queue job data types | `src/lib/schema/schemaJobs/schemaJobTypes.ts` (`SchemaJobQueueData`) |
| Job status API | `src/routes/api/schema/jobs/[jobId].ts` |
| Admin UI (start + poll) | `src/pages/admin/schema/SchemaJobRunner.tsx` |

---

## Operational notes

- **Redis** must be running for jobs to be accepted and processed.
- **Subdomain isolation:** enqueue and poll always use the request’s subdomain session; the job payload carries `subDomain` / `databaseName`, and the jobs API rejects cross-tenant access.
- **Retries:** BullMQ default retry/backoff applies (`schemaJobQueue` uses shared `defaultJobOptions` from `redisConfig.ts`).
