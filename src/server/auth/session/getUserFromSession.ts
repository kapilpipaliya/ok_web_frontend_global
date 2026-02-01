import type { APIEvent } from "@solidjs/start/server";
import { getRequestEvent } from "solid-js/web";

import { convertNodeToJson } from "~/cypher/conversion/convertNodeToJson";
import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { getHttpsSession } from "~/server/auth/session/getHttpsSession";
import type { Vertex } from "~/lib/graph/type/vertex";
import { getDriver } from "~/cypher/core/driver";
import { ADMIN_DB_NAME } from "~/cypher/core/boltConstant";
import { getAdminUser } from "~/cypher/permissions/utils/getAdminUser";
import { getShopifyClient, ensureShopDatabaseAndMigrate, getDBSessionForShop } from "~/lib/shopify/shopifyHelpers";
import { updateSession } from "~/server/auth/session/updateSession";

export async function getSessionUser(): Promise<undefined | Vertex> {
  // Check if hostname is decodeproduct.decodecommerce.com
  const event = getRequestEvent();
  try {
    if (event) {
      try {
        const urlObj = new URL(event.request.url);
        if (urlObj.hostname === "decodeproduct.decodecommerce.com") {
          // Authenticate with Shopify to get shop
          const shopify = getShopifyClient();
          const result = await shopify.authenticate.admin(event.request);
          const shop = result.session.shop;
          
          if (shop) {
            // Get database session for this shop (assumes database already exists)
            const { dbSession, subDomain } = await getDBSessionForShop(shop);
            
            try {
              // Find or create user in the database
              const user = await dbSession.executeWrite(async (tx) => {
                // Check if user already exists by email (shop) or uuid (shop)
                const existingUserResult = await tx.run(
                  `MATCH (u:User)
                   WHERE u.email = $shop OR u.uuid = $shop
                   RETURN u
                   LIMIT 1`,
                  { shop }
                );

                let userNode;
                
                if (existingUserResult.records.length > 0) {
                  // User exists, return the existing node (no updates needed)
                  userNode = existingUserResult.records[0].get('u');
                } else {
                  // User doesn't exist, create it with only basic properties
                  const createResult = await tx.run(
                    `CREATE (u:User {
                      email: $shop,
                      uuid: $shop,
                      createdAt: datetime()
                    })
                    RETURN u`,
                    {
                      shop,
                    }
                  );
                  userNode = createResult.records[0].get('u');
                }

                // Convert Neo4j node to Vertex format
                return convertNodeToJson(userNode);
              });

              // Add Shopify-related properties to user object for session only (not saved in DB)
              user.P.shop = shop;
              user.P.shopDb = subDomain;

              // Update HTTP session with the user from database (with Shopify properties in session only)
              // await updateSession(user);
              
              return user;
            } finally {
              // Close the database session
              await dbSession.close();
            }
          }
        }
      } catch (errorOrResponse) {
        if (errorOrResponse instanceof Response) {
          if (event && event.response) {
            errorOrResponse.headers.forEach((value, key) => {
              event.response.headers.set(key, value);
            });
          }
        }
        // If Shopify authentication fails, fall through to regular session check
        console.error("Error in Shopify authentication for getSessionUser:", errorOrResponse);
      }
    }
    
    // Regular session check for other hostnames
    const httpSession = await getHttpsSession();
    const sessionUser = httpSession?.data?.user;
    if (!sessionUser) return;
    return sessionUser;
  } catch {
    return;
  }
}

// Note: this return user from 'admin' database. so use uuid to find user from current subdomain.
export async function getUserFromSession(
  request?: APIEvent["request"],
): Promise<undefined | Vertex> {
  let dbSession = null;
  let adminDbSession = null;

  try {
    const sessionUser = await getSessionUser();

    if (!sessionUser) {
      return;
    }
    if (sessionUser?.P?.shop) {
      return sessionUser;
    } 

    // Get user password from database
    const sessionData = await getDBSessionForSubdomain(request);
    dbSession = sessionData.dbSession;
    const subDomain = sessionData.subDomain;
    const query = "MATCH (u:User {uuid: $uuid}) RETURN u as u";
    const result = await dbSession.run(query, { uuid: sessionUser.P.uuid });

    if (result.records.length === 0) {
      return;
    }

    const userFromDb = convertNodeToJson(result.records[0].get("u"));

    if (!userFromDb.P.password) {
      // Create admin session
      const driver = await getDriver();
      adminDbSession = driver.session({ database: ADMIN_DB_NAME });

      // Check if user is a system user and get the user data
      const { exists, user: systemUser } = await getAdminUser(
        sessionUser.P.uuid,
        subDomain,
        adminDbSession,
      );

      if (exists && systemUser) {
        if (systemUser.P.password === sessionUser.P.password) {
          return systemUser;
        }
        return;
      }
    }

    // Return undefined if passwords don't match
    if (!userFromDb || userFromDb.P.password !== sessionUser.P.password) {
      return;
    }

    return sessionUser;
  } catch (error) {
    console.error("Error in getUserFromSession:", error);
    // Handle the error silently, returning undefined
    return;
  } finally {
    // Ensure sessions are always closed
    if (dbSession) {
      await dbSession.close();
    }
    if (adminDbSession) {
      await adminDbSession.close();
    }
  }
}
