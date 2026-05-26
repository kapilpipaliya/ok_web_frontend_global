import type { APIEvent } from "@solidjs/start/server";
import { getRequestEvent } from "solid-js/web";

import { convertNodeToJson } from "~/cypher/conversion/convertNodeToJson";
import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { getHttpsSession } from "~/server/auth/session/getHttpsSession";
import type { Vertex } from "~/lib/graph/type/vertex";
import { getDriver } from "~/cypher/core/driver";
import { ADMIN_DB_NAME } from "~/cypher/core/boltConstant";
import { getAdminUser } from "~/cypher/permissions/utils/getAdminUser";
import { isAppSubdomain } from "~/lib/appSubdomain";
import { getShopify } from "~/lib/shopify/shopify.server";
import {
  getDBSessionForShop,
  getShopEmailFromShopifyAdmin,
} from "~/lib/shopify/shopifyHelpers";
import { validateEmail } from "~/lib/validation/validateEmail";
import { isUserInactiveForSignIn } from "~/lib/auth/userSignInEligibility";

export async function getSessionUser(): Promise<undefined | Vertex> {
  // Check if hostname is one of the app subdomains (decodeproduct, orvio, decodefile)
  const event = getRequestEvent();
  try {
    if (event) {
      try {
        const urlObj = new URL(event.request.url);
        if (isAppSubdomain(urlObj.hostname) && event.request.headers.get("authorization")) {
          // Authenticate with Shopify to get shop
          const { dbSession: authDbSession, subDomain } = await getDBSessionForSubdomain(event.request);
          try {
            const shopify = await getShopify(subDomain, authDbSession);
            const result = await shopify.authenticate.admin(event.request);
            const shop = result.session.shop;

            if (shop) {
              const shopEmail = await getShopEmailFromShopifyAdmin(result.admin);
              if (!shopEmail || validateEmail(shopEmail)) {
                return undefined;
              }
              const email = shopEmail.trim();

              const appSessionData = await getDBSessionForSubdomain(
                event.request,
              );
              try {
                const { dbSession, subDomain } = await getDBSessionForShop(
                  shop,
                  appSessionData.subDomain,
                );

                try {
                  const userResult = await dbSession.run(
                    `MATCH (u:User {email: $email}) RETURN u LIMIT 1`,
                    { email },
                  );

                  if (userResult.records.length === 0) {
                    return undefined;
                  }

                  const user = convertNodeToJson(
                    userResult.records[0].get("u"),
                  );

                  user.P.shop = shop;
                  user.P.shopDb = subDomain;

                  return user;
                } catch (err) {
                  console.error("Error loading Shopify session user:", err);
                  throw err;
                } finally {
                  await dbSession.close();
                }
              } finally {
                await appSessionData.dbSession.close();
              }
            }

            return undefined;
          } finally {
            await authDbSession.close();
          }
        }
      } catch (errorOrResponse) {
        if (errorOrResponse instanceof Response) {
          // Check if we're in a server function context (API route) vs normal page load
          const isServerFunctionCall = event && (() => {
            try {
              const urlObj = new URL(event.request.url);
              // Server functions are called via API routes or _server endpoint
              return urlObj.pathname.startsWith('/api/') || urlObj.pathname.startsWith('/_server');
            } catch {
              return false;
            }
          })();
          if (isServerFunctionCall && event?.response) {
            // In server function context: try to copy headers if they're writable
            try {
              // Copy headers from the Shopify Response
              // This will throw if headers have already been sent
              errorOrResponse.headers.forEach((value, key) => {
                event.response.headers.set(key, value);
              });
            } catch (headerError) {
              // Headers were already sent - can't modify them
              // This is expected for normal page loads where response may have been sent by parallel code
              console.log("Cannot set headers (already sent), falling through to regular session check");
            }
          } else {
            // Not a server function call or no event.response: fall through to regular session check
            // The response may already have been sent (e.g. by parallel code in GetInitialData),
            // which causes "Cannot set headers after they are sent" error.
            console.log("Shopify authentication returned Response (likely a page load), falling through to regular session check");
          }
        } else {
          // If Shopify authentication fails with a non-Response error, log and fall through
          console.error("Error in Shopify authentication for getSessionUser:", errorOrResponse);
        }
      }
    }
    
    // Regular session check for other hostnames
    const httpSession = await getHttpsSession();
    const sessionUser = httpSession?.data?.user;
    if (!sessionUser) return;
    return sessionUser;
  } catch (error) {
    console.error("Error in getSessionUser:", error);
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

    if (isUserInactiveForSignIn(userFromDb)) {
      return;
    }

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
