/**
 * Shopify shop migration request state.
 *
 * Admin DB (global):
 * - ShopMigrationRequest { key: 'global', migrationRequestAt: datetime }: when admin last requested migration for all shops
 *
 * Shop DB (per-shop database, e.g. shopdecodeproducts2myshopifycom):
 * - ShopMigration { shop, lastMigrationAt?, migrationInProgressAt? }: that shop's last migration time and in-progress flag
 *
 * Migration runs for a shop only when migrationRequestAt > that shop's lastMigrationAt
 * (or lastMigrationAt is null). While migration runs, migrationInProgressAt is set in the shop DB
 * so other requests can wait and retry instead of running migration in parallel.
 */

import type { Session } from "neo4j-driver";
import { int } from "neo4j-driver";
import { getDriver } from "~/cypher/core/driver";
import { ADMIN_DB_NAME } from "~/cypher/core/boltConstant";

const SHOP_MIGRATION_REQUEST_KEY = "global";

/**
 * Get the global "migration request for all shops" timestamp from admin DB.
 * Returns null if never set.
 */
export async function getMigrationRequestForAllShops(): Promise<Date | null> {
  const driver = await getDriver();
  const session = driver.session({ database: ADMIN_DB_NAME });
  try {
    const result = await session.run(
      `MATCH (s:ShopMigrationRequest {key: $key})
       RETURN s.migrationRequestAt as at`,
      { key: SHOP_MIGRATION_REQUEST_KEY },
    );
    if (result.records.length === 0) return null;
    const at = result.records[0].get("at");
    if (at == null) return null;
    // Neo4j datetime comes back as { year, month, day, ... } or Integer(epoch)
    const date = toDate(at);
    return date ?? null;
  } finally {
    await session.close();
  }
}

/**
 * Save the global "migration request for all shops" timestamp to now.
 * Admin calls this to signal that all shops should run migration when next loaded
 * (if their lastMigrationAt is older than this time).
 */
export async function saveMigrationRequestForAllShops(): Promise<Date> {
  const driver = await getDriver();
  const session = driver.session({ database: ADMIN_DB_NAME });
  try {
    await session.executeWrite(async (tx) => {
      await tx.run(
        `MERGE (s:ShopMigrationRequest {key: $key})
         SET s.migrationRequestAt = datetime()`,
        { key: SHOP_MIGRATION_REQUEST_KEY },
      );
    });
    const at = await getMigrationRequestForAllShops();
    return at ?? new Date();
  } finally {
    await session.close();
  }
}

/**
 * Get the last migration timestamp for a shop from that shop's database.
 * Returns null if never migrated (or not tracked).
 * @param shopDbSession - Session to the shop's Neo4j database (not admin).
 */
export async function getShopLastMigrationAt(
  shop: string,
  shopDbSession: Session,
): Promise<Date | null> {
  const result = await shopDbSession.run(
    `MATCH (s:ShopMigration {shop: $shop})
     RETURN s.lastMigrationAt as at`,
    { shop },
  );
  if (result.records.length === 0) return null;
  const at = result.records[0].get("at");
  if (at == null) return null;
  const date = toDate(at);
  return date ?? null;
}

/**
 * Set the last migration timestamp for a shop in that shop's database.
 * @param shopDbSession - Session to the shop's Neo4j database (not admin).
 */
export async function setShopLastMigrationAt(
  shop: string,
  at: Date,
  shopDbSession: Session,
): Promise<void> {
  const ms = at.getTime();
  await shopDbSession.executeWrite(async (tx) => {
    await tx.run(
      `MERGE (s:ShopMigration {shop: $shop})
       SET s.lastMigrationAt = datetime.fromEpoch($epochSeconds, $epochNanoseconds)`,
      {
        shop,
        epochSeconds: int(Math.floor(ms / 1000)),
        epochNanoseconds: int(Math.floor((ms % 1000) * 1e6)),
      },
    );
  });
}

/**
 * Check if migration is currently in progress for this shop (migrationInProgressAt is set in shop DB).
 * @param shopDbSession - Session to the shop's Neo4j database (not admin).
 */
export async function isMigrationInProgress(
  shop: string,
  shopDbSession: Session,
): Promise<boolean> {
  const result = await shopDbSession.run(
    `MATCH (s:ShopMigration {shop: $shop})
     WHERE s.migrationInProgressAt IS NOT NULL
     RETURN 1 as inProgress`,
    { shop },
  );
  return result.records.length > 0;
}

/**
 * Try to claim migration for this shop: set migrationInProgressAt only if not already set (in shop DB).
 * Returns true if we claimed it, false if another process already has it.
 * @param shopDbSession - Session to the shop's Neo4j database (not admin).
 */
export async function tryClaimMigration(
  shop: string,
  shopDbSession: Session,
): Promise<boolean> {
  const result = await shopDbSession.executeWrite(async (tx) => {
    const r = await tx.run(
      `MERGE (s:ShopMigration {shop: $shop})
       WITH s
       WHERE s.migrationInProgressAt IS NULL
       SET s.migrationInProgressAt = datetime()
       RETURN s.shop as shop`,
      { shop },
    );
    return r;
  });
  return result.records.length > 0;
}

/**
 * Clear migration-in-progress and set last migration time for this shop (in shop DB).
 * Call after migration completes (success or failure so next request can retry).
 * @param shopDbSession - Session to the shop's Neo4j database (not admin).
 */
export async function clearMigrationInProgressAndSetLastAt(
  shop: string,
  at: Date,
  shopDbSession: Session,
): Promise<void> {
  const ms = at.getTime();
  await shopDbSession.executeWrite(async (tx) => {
    await tx.run(
      `MERGE (s:ShopMigration {shop: $shop})
       SET s.lastMigrationAt = datetime.fromEpoch($epochSeconds, $epochNanoseconds)
       REMOVE s.migrationInProgressAt`,
      {
        shop,
        epochSeconds: int(Math.floor(ms / 1000)),
        epochNanoseconds: int(Math.floor((ms % 1000) * 1e6)),
      },
    );
  });
}

/**
 * Clear migration-in-progress only in shop DB (e.g. after migration failure so another request can retry).
 * @param shopDbSession - Session to the shop's Neo4j database (not admin).
 */
export async function clearMigrationInProgress(
  shop: string,
  shopDbSession: Session,
): Promise<void> {
  await shopDbSession.executeWrite(async (tx) => {
    await tx.run(
      `MATCH (s:ShopMigration {shop: $shop})
       REMOVE s.migrationInProgressAt`,
      { shop },
    );
  });
}

/**
 * Returns true if migration should run for this shop:
 * - No configuration for last run migration (no ShopMigration record or lastMigrationAt null in shop DB)
 *   means migration has never run → run it.
 * - Global migration request time not set (backward compat) → run it.
 * - Global migration request time is set and is greater than shop's last migration time → run it.
 * @param shopDbSession - Session to the shop's Neo4j database (not admin).
 */
export async function shouldRunMigrationForShop(
  shop: string,
  shopDbSession: Session,
): Promise<boolean> {
  const lastAt = await getShopLastMigrationAt(shop, shopDbSession);
  if (lastAt == null) return true; // no last run config = migration never run, so run it
  const requestAt = await getMigrationRequestForAllShops();
  if (requestAt == null) return true; // backward compat: no global request yet, run migration
  return requestAt.getTime() > lastAt.getTime();
}

function toDate(value: unknown): Date | null {
  if (value instanceof Date) return value;
  if (typeof value === "number") return new Date(value);
  if (value && typeof value === "object" && "toStandardDate" in value) {
    return (value as { toStandardDate(): Date }).toStandardDate();
  }
  if (value && typeof value === "object" && "year" in value) {
    const v = value as {
      year: { toNumber?: () => number };
      month: { toNumber?: () => number };
      day: { toNumber?: () => number };
      hour: { toNumber?: () => number };
      minute: { toNumber?: () => number };
      second: { toNumber?: () => number };
    };
    const y = typeof v.year === "number" ? v.year : v.year?.toNumber?.() ?? 0;
    const m = typeof v.month === "number" ? v.month : v.month?.toNumber?.() ?? 0;
    const d = typeof v.day === "number" ? v.day : v.day?.toNumber?.() ?? 0;
    const h = typeof v.hour === "number" ? v.hour : v.hour?.toNumber?.() ?? 0;
    const min = typeof v.minute === "number" ? v.minute : v.minute?.toNumber?.() ?? 0;
    const sec = typeof v.second === "number" ? v.second : v.second?.toNumber?.() ?? 0;
    return new Date(y, m - 1, d, h, min, sec);
  }
  return null;
}
