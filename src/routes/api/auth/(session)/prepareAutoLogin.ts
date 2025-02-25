import type { APIEvent } from "@solidjs/start/server";

import { parse } from "tldts";

import type { Vertex } from "~/lib/graph/graph";

import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";
import { findUserByEmailSimple } from "~/cypher/mutate/user/findUserByEmail";
import { APIError, handleAPIError } from "~/lib/api/apiErrorHandler";
import { generateSecureToken } from "~/lib/auth/secureToken";
import { encodeUserData } from "~/lib/auth/userDataEncoder";
import { getUserFromSession } from "~/server/session/getUserFromSession";

export async function GET({ request }: APIEvent) {
  try {
    const url = new URL(request.url);
    const { targetDomain, targetSubdomain } = validateRequest(url);

    const { dbSession } = await getDBSessionForSubdomain(request);
    const user = await getUserFromSession(request);
    const existingUser = await findUserByEmailSimple(dbSession, user?.P?.email);

    const validatedUser = validateUser(existingUser);

    const userData = encodeUserData({
      email: validatedUser.P.email,
      username: validatedUser.P.username,
      uuid: validatedUser.P.uuid,
    });

    // Generate a secure token instead of passing user data directly
    const secureToken = await generateSecureToken(userData, dbSession);

    // Generate the target URL with the token
    const host = request.headers.get("host") || "";
    const autoLoginUrl = buildAutoLoginUrl(
      url.protocol,
      host,
      targetDomain,
      targetSubdomain,
      secureToken,
    );

    return new Response(null, {
      headers: { Location: autoLoginUrl },
      status: 302,
    });
  } catch (error) {
    return handleAPIError(error);
  }
}

function buildAutoLoginUrl(
  protocol: string,
  host: string,
  targetDomain: null | string,
  targetSubdomain: null | string,
  secureToken: string,
) {
  if (host.includes("localhost")) {
    // For localhost, use port if present
    const port = host.split(":")[1] ? `:${host.split(":")[1]}` : "";
    return `${protocol}//localhost${port}/api/auth/auto-login?token=${secureToken}`;
  }

  const parsedDomain = parse(host);
  const baseDomain = parsedDomain.domain;

  if (targetDomain) {
    return `${protocol}//${targetDomain}/api/auth/auto-login?token=${secureToken}`;
  }
  return `${protocol}//${targetSubdomain}.${baseDomain}/api/auth/auto-login?token=${secureToken}`;
}

function validateRequest(url: URL) {
  const targetSubdomain = url.searchParams.get("subdomain");
  const targetDomain = url.searchParams.get("domain");

  if (!(targetSubdomain || targetDomain)) {
    throw new APIError("Missing subdomain or domain parameter", 400);
  }

  return { targetDomain, targetSubdomain };
}

function validateUser(user?: null | Vertex) {
  if (!(user?.P.email && user.P.username && user.P.uuid)) {
    throw new APIError("Missing user data", 401);
  }
  return user;
}
