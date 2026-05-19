/** Neo4j database names for per-merchant Shopify shops use the `shop` prefix. */
export function isShopDatabaseName(databaseName: string): boolean {
  return databaseName.toLowerCase().startsWith("shop");
}

/**
 * Normalize a Shopify shop domain into a Neo4j database name.
 */
export function getDatabaseNameForShop(
  shop: string,
  appSubDomain?: string,
): string {
  let normalizedShop = shop
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .replace(/^-+|-+$/g, "");

  normalizedShop = normalizedShop.replace(/myshopifycom$/, "");

  if (appSubDomain) {
    const normalizedAppSubDomain = appSubDomain
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "")
      .replace(/^-+|-+$/g, "");
    return normalizedAppSubDomain
      ? `shop${normalizedAppSubDomain}${normalizedShop}`
      : `shop${normalizedShop}`;
  }
  return `shop${normalizedShop}`;
}
