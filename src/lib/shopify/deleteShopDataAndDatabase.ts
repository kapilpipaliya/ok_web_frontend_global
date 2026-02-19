import { getDriver } from "~/cypher/core/driver";
import { getDatabaseNameForShop } from "~/lib/shopify/shopifyHelpers";

/**
 * Deletes all Shopify sessions for the shop and drops the shop's Neo4j database.
 * Used when the app is uninstalled (webhook), shop/redact compliance webhook, or for manual cleanup.
 */
export async function deleteShopDataAndDatabase(shop: string): Promise<void> {
  const dbName = getDatabaseNameForShop(shop);
  const driver = await getDriver();
  const systemSession = driver.session();

  try {
    await systemSession.run(`DROP DATABASE ${dbName} IF EXISTS`);
    console.log(`Dropped database ${dbName} for ${shop}`);
  } catch (error) {
    console.error(`Failed to drop database ${dbName} for ${shop}:`, error);
  } finally {
    await systemSession.close();
  }
}
