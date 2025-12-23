import type { Session as ShopifySession } from "@shopify/shopify-api";
import type { Session as Neo4jSession } from "neo4j-driver";
import type { SessionStorage } from "@shopify/shopify-app-session-storage";

import { getDriver } from "~/cypher/core/driver";
import { getDatabaseNameForShop } from "./shopifyHelpers";

/**
 * Neo4j session store adapter for Shopify sessions.
 *
 * Stores Shopify OAuth sessions in Neo4j database, with one database per shop.
 * Each session is stored as a ShopifySession node with the session ID as the key.
 *
 * Usage:
 * ```typescript
 * const sessionStore = new Neo4jSessionStore();
 * const shopify = shopifyApi({
 *   // ... config
 *   sessionStorage: sessionStore,
 * });
 * ```
 */
export class Neo4jSessionStore implements SessionStorage {
  /**
   * Helper method to reconstruct a Shopify Session from Neo4j node properties.
   *
   * @param properties - Node properties from Neo4j
   * @returns ShopifySession instance
   */
  private async reconstructSession(properties: any): Promise<ShopifySession> {
    // Reconstruct session data
    const sessionData: any = {
      id: properties.id,
      shop: properties.shop,
      state: properties.state || "",
      isOnline: properties.isOnline,
      scope: properties.scope || undefined,
      accessToken: properties.accessToken || undefined,
      refreshToken: properties.refreshToken || undefined,
    };

    // Parse dates
    if (properties.expires) {
      sessionData.expires = new Date(properties.expires);
    }
    if (properties.refreshTokenExpires) {
      sessionData.refreshTokenExpires = new Date(
        properties.refreshTokenExpires,
      );
    }

    // Parse onlineAccessInfo if present
    if (properties.onlineAccessInfo) {
      try {
        sessionData.onlineAccessInfo = JSON.parse(properties.onlineAccessInfo);
      } catch (e) {
        console.warn(
          `[Neo4jSessionStore] Failed to parse onlineAccessInfo for session ${properties.id}`,
        );
      }
    }

    // Create Shopify Session from data
    const { Session } = await import("@shopify/shopify-api");
    return new Session(sessionData);
  }

  /**
   * Store a Shopify session in Neo4j.
   *
   * @param session - The Shopify session to store
   * @returns Promise<boolean> - True if successful
   */
  async storeSession(session: ShopifySession): Promise<boolean> {
    const shop = session.shop;
    const sessionId = session.id;
    const subDomain = getDatabaseNameForShop(shop);

    const driver = await getDriver();
    const dbSession = driver.session({ database: subDomain });

    try {
      // Convert session to object for storage
      const sessionData = session.toObject();

      // Store session data as properties on a ShopifySession node
      const query = `
        MERGE (s:ShopifySession {id: $sessionId})
        ON CREATE SET s.createdAt = datetime()
        SET s.shop = $shop,
            s.state = $state,
            s.isOnline = $isOnline,
            s.scope = $scope,
            s.expires = $expires,
            s.accessToken = $accessToken,
            s.refreshToken = $refreshToken,
            s.refreshTokenExpires = $refreshTokenExpires,
            s.updatedAt = datetime()
      `;

      await dbSession.run(query, {
        sessionId,
        shop: sessionData.shop,
        state: sessionData.state || "",
        isOnline: sessionData.isOnline,
        scope: sessionData.scope || null,
        expires: sessionData.expires
          ? new Date(sessionData.expires).toISOString()
          : null,
        accessToken: sessionData.accessToken || null,
        refreshToken: sessionData.refreshToken || null,
        refreshTokenExpires: sessionData.refreshTokenExpires
          ? new Date(sessionData.refreshTokenExpires).toISOString()
          : null,
      });

      // Store onlineAccessInfo if present (for online sessions)
      if (sessionData.onlineAccessInfo) {
        const onlineInfo = sessionData.onlineAccessInfo;
        const onlineInfoQuery = `
          MATCH (s:ShopifySession {id: $sessionId})
          SET s.onlineAccessInfo = $onlineAccessInfo
        `;

        await dbSession.run(onlineInfoQuery, {
          sessionId,
          onlineAccessInfo: JSON.stringify(onlineInfo),
        });
      }

      return true;
    } catch (error) {
      console.error(
        `[Neo4jSessionStore] Error storing session ${sessionId}:`,
        error,
      );
      return false;
    } finally {
      await dbSession.close();
    }
  }

  /**
   * Load a Shopify session from Neo4j.
   *
   * @param id - The session ID to load
   * @returns Promise<ShopifySession | undefined> - The session if found
   */
  async loadSession(id: string): Promise<ShopifySession | undefined> {
    // Session ID format: "{shop}_{isOnline}" or "{shop}_{userId}_{isOnline}"
    // Extract shop from session ID
    const parts = id.split("_");
    if (parts.length < 2) {
      console.warn(`[Neo4jSessionStore] Invalid session ID format: ${id}`);
      return undefined;
    }

    // Try to determine shop from session ID
    // Format: "offline_{shop}" or "{shop}_{userId}_{isOnline}"
    let shop: string | undefined;
    if (parts[0] === "offline") {
      shop = parts
        .slice(1)
        .join("_")
        .replace(/_offline$/, "");
    } else {
      // For online sessions, shop is typically the first part
      shop = parts[0];
    }

    if (!shop) {
      console.warn(
        `[Neo4jSessionStore] Could not extract shop from session ID: ${id}`,
      );
      return undefined;
    }

    const subDomain = getDatabaseNameForShop(shop);
    const driver = await getDriver();
    const dbSession = driver.session({ database: subDomain });

    try {
      const query = `
        MATCH (s:ShopifySession {id: $id})
        RETURN s
      `;

      const result = await dbSession.run(query, { id });

      if (result.records.length === 0) {
        return undefined;
      }

      const node = result.records[0].get("s");
      const properties = node.properties;

      return await this.reconstructSession(properties);
    } catch (error) {
      console.error(`[Neo4jSessionStore] Error loading session ${id}:`, error);
      return undefined;
    } finally {
      await dbSession.close();
    }
  }

  /**
   * Delete a Shopify session from Neo4j.
   *
   * @param id - The session ID to delete
   * @returns Promise<boolean> - True if successful
   */
  async deleteSession(id: string): Promise<boolean> {
    // Extract shop from session ID (same logic as loadSession)
    const parts = id.split("_");
    if (parts.length < 2) {
      console.warn(`[Neo4jSessionStore] Invalid session ID format: ${id}`);
      return false;
    }

    let shop: string | undefined;
    if (parts[0] === "offline") {
      shop = parts
        .slice(1)
        .join("_")
        .replace(/_offline$/, "");
    } else {
      shop = parts[0];
    }

    if (!shop) {
      console.warn(
        `[Neo4jSessionStore] Could not extract shop from session ID: ${id}`,
      );
      return false;
    }

    const subDomain = getDatabaseNameForShop(shop);
    const driver = await getDriver();
    const dbSession = driver.session({ database: subDomain });

    try {
      const query = `
        MATCH (s:ShopifySession {id: $id})
        DELETE s
      `;

      await dbSession.run(query, { id });
      return true;
    } catch (error) {
      console.error(`[Neo4jSessionStore] Error deleting session ${id}:`, error);
      return false;
    } finally {
      await dbSession.close();
    }
  }

  /**
   * Delete an array of sessions from storage.
   *
   * @param ids - Array of session IDs to delete
   * @returns Promise<boolean> - True if all deletions were successful
   */
  async deleteSessions(ids: string[]): Promise<boolean> {
    if (ids.length === 0) {
      return true;
    }

    // Group sessions by shop to optimize database operations
    const shopSessionsMap = new Map<string, string[]>();

    for (const id of ids) {
      // Extract shop from session ID (same logic as loadSession)
      const parts = id.split("_");
      if (parts.length < 2) {
        console.warn(`[Neo4jSessionStore] Invalid session ID format: ${id}`);
        continue;
      }

      let shop: string | undefined;
      if (parts[0] === "offline") {
        shop = parts
          .slice(1)
          .join("_")
          .replace(/_offline$/, "");
      } else {
        shop = parts[0];
      }

      if (!shop) {
        console.warn(
          `[Neo4jSessionStore] Could not extract shop from session ID: ${id}`,
        );
        continue;
      }

      if (!shopSessionsMap.has(shop)) {
        shopSessionsMap.set(shop, []);
      }
      shopSessionsMap.get(shop)!.push(id);
    }

    // Delete sessions grouped by shop
    const driver = await getDriver();
    let allSuccessful = true;

    for (const [shop, sessionIds] of shopSessionsMap) {
      const subDomain = getDatabaseNameForShop(shop);
      const dbSession = driver.session({ database: subDomain });

      try {
        const query = `
          MATCH (s:ShopifySession)
          WHERE s.id IN $ids
          DELETE s
        `;

        await dbSession.run(query, { ids: sessionIds });
      } catch (error) {
        console.error(
          `[Neo4jSessionStore] Error deleting sessions for shop ${shop}:`,
          error,
        );
        allSuccessful = false;
      } finally {
        await dbSession.close();
      }
    }

    return allSuccessful;
  }

  /**
   * Return an array of sessions for a given shop.
   *
   * @param shop - The shop domain
   * @returns Promise<ShopifySession[]> - Array of sessions (empty if none found)
   */
  async findSessionsByShop(shop: string): Promise<ShopifySession[]> {
    const subDomain = getDatabaseNameForShop(shop);
    const driver = await getDriver();
    const dbSession = driver.session({ database: subDomain });

    try {
      const query = `
        MATCH (s:ShopifySession {shop: $shop})
        RETURN s
        ORDER BY s.createdAt DESC
      `;

      const result = await dbSession.run(query, { shop });

      const sessions: ShopifySession[] = [];
      for (const record of result.records) {
        const node = record.get("s");
        const properties = node.properties;
        try {
          const session = await this.reconstructSession(properties);
          sessions.push(session);
        } catch (error) {
          console.error(
            `[Neo4jSessionStore] Error reconstructing session ${properties.id}:`,
            error,
          );
        }
      }

      return sessions;
    } catch (error) {
      console.error(
        `[Neo4jSessionStore] Error finding sessions for shop ${shop}:`,
        error,
      );
      return [];
    } finally {
      await dbSession.close();
    }
  }

  /**
   * Delete all sessions for a specific shop.
   * Useful for cleanup or when uninstalling an app.
   *
   * @param shop - The shop domain
   * @returns Promise<number> - Number of sessions deleted
   */
  async deleteSessionsByShop(shop: string): Promise<number> {
    const subDomain = getDatabaseNameForShop(shop);
    const driver = await getDriver();
    const dbSession = driver.session({ database: subDomain });

    try {
      const query = `
        MATCH (s:ShopifySession {shop: $shop})
        DELETE s
        RETURN count(s) as deletedCount
      `;

      const result = await dbSession.run(query, { shop });
      const deletedCount =
        result.records[0]?.get("deletedCount")?.toNumber() || 0;
      return deletedCount;
    } catch (error) {
      console.error(
        `[Neo4jSessionStore] Error deleting sessions for shop ${shop}:`,
        error,
      );
      return 0;
    } finally {
      await dbSession.close();
    }
  }
}

// Singleton instance of Neo4j session store
let neo4jSessionStoreInstance: Neo4jSessionStore | null = null;

/**
 * Get or create the Neo4j session store instance.
 */
export function getNeo4jSessionStore(): Neo4jSessionStore {
  if (!neo4jSessionStoreInstance) {
    neo4jSessionStoreInstance = new Neo4jSessionStore();
  }
  return neo4jSessionStoreInstance;
}
