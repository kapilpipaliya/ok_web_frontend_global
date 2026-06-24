import type { APIEvent } from "@solidjs/start/server";

import { parse } from "tldts";

import { ADMIN_DB_NAME } from "~/cypher/core/boltConstant";
import { findUserVertexSimple } from "~/cypher/mutate/user/findUserByEmailOrUuid";
import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { API } from "~/lib/api/endpoints";
import { APIError, handleAPIError } from "~/lib/api/server/apiErrorHandler";
import { generateSecureToken } from "~/lib/auth/secureToken";
import { encodeUserData } from "~/lib/auth/userDataEncoder";
import { getUserFromSession } from "~/server/auth/session/getUserFromSession";
import type { Vertex } from "~/lib/graph/type/vertex";

/**
 * Prepare auto sign-in for cross-subdomain authentication
 *
 * CRITICAL SESSION MANAGEMENT:
 * - Creates database session to generate secure token
 * - MUST close session in finally block to prevent leaks
 * - Session leak was causing Neo4j to become unresponsive over time
 */
export async function GET({ request }: APIEvent) {
  const { dbSession, subDomain } = await getDBSessionForSubdomain(request);

  try {
    const url = new URL(request.url);
    const { targetDomain, targetSubdomain, redirectPath } =
      validateRequest(url);

    if (subDomain !== ADMIN_DB_NAME) {
      throw new APIError(
        "Only system database can be used for auto signIn",
        400,
      );
    }

    const user = await getUserFromSession(request);
    const existingUser = await findUserVertexSimple(
      dbSession,
      user?.P?.uuid,
      user?.P?.email || user?.P?.username,
    );

    const validatedUser = validateUser(existingUser);

    const userData = encodeUserData({
      email: validatedUser.P.email,
      username: validatedUser.P.username,
      uuid: validatedUser.P.uuid,
    });

    // Generate a secure token instead of passing user data directly
    const secureToken = await generateSecureToken(userData, dbSession);

    // Generate the target URL with the token
    const autoSignInUrl = buildautoSignInUrl(
      url,
      targetDomain,
      targetSubdomain,
      secureToken,
      redirectPath,
    );

    return new Response(null, {
      headers: { Location: autoSignInUrl },
      status: 302,
    });
  } catch (error) {
    return handleAPIError(error);
  } finally {
    // CRITICAL: Close session to prevent leak
    // This function is called on every cross-subdomain navigation
    // Without this cleanup, sessions accumulate and exhaust Neo4j connection pool
    await dbSession.close();
  }
}

function buildautoSignInUrl(
  url: URL,
  targetDomain: null | string,
  targetSubdomain: null | string,
  secureToken: string,
  redirectPath: null | string,
) {
  const protocol = url.protocol;
  const hostname = url.hostname;
  const redirectQuery = redirectPath
    ? `&redirect=${encodeURIComponent(redirectPath)}`
    : "";

  // Check if this is a localhost environment (localhost, *.localhost, or *.localhost.*)
  const parsed = parse(hostname);
  const isLocalhost =
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    (parsed.domain && parsed.domain.startsWith("localhost."));

  if (isLocalhost) {
    // For localhost environments, build URL with targetSubdomain or targetDomain
    const port = url.port ? `:${url.port}` : "";

    if (targetDomain) {
      return `${protocol}//${targetDomain}${API.auth.autoSignInUrl}?token=${secureToken}${redirectQuery}`;
    }

    // Extract base domain from current hostname
    // For "admin.localhost.com" -> "localhost.com"
    // For "admin.localhost.org" -> "localhost.org"
    // For "admin.localhost" -> "localhost"
    // For "localhost" -> "localhost"
    let localhostBase: string;
    if (hostname === "localhost" || hostname.endsWith(".localhost")) {
      localhostBase = "localhost";
    } else {
      // For localhost with TLD (e.g., localhost.com, localhost.org)
      localhostBase = parsed.domain || "localhost";
    }

    return `${protocol}//${targetSubdomain}.${localhostBase}${port}${API.auth.autoSignInUrl}?token=${secureToken}${redirectQuery}`;
  }

  // For production domains, use the base domain from parsed result
  const baseDomain = parsed.domain;

  if (targetDomain) {
    return `${protocol}//${targetDomain}${API.auth.autoSignInUrl}?token=${secureToken}${redirectQuery}`;
  }
  return `${protocol}//${targetSubdomain}.${baseDomain}${API.auth.autoSignInUrl}?token=${secureToken}${redirectQuery}`;
}

function validateRedirectPath(value: null | string): null | string {
  if (!value) {
    return null;
  }
  const trimmed = value.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    throw new APIError("Invalid redirect path", 400);
  }
  return trimmed;
}

function validateRequest(url: URL) {
  const targetSubdomain = url.searchParams.get("subdomain");
  const targetDomain = url.searchParams.get("domain");
  const redirectPath = validateRedirectPath(url.searchParams.get("redirect"));

  if (!(targetSubdomain || targetDomain)) {
    throw new APIError("Missing subdomain or domain parameter", 400);
  }

  return { targetDomain, targetSubdomain, redirectPath };
}

function validateUser(user?: null | Vertex) {
  if (!(user?.P.email && user.P.username && user.P.uuid)) {
    throw new APIError("Missing user data", 401);
  }
  return user;
}
