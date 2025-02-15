import type { APIEvent } from "@solidjs/start/dist/server";

import { parse } from "tldts";

import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";
import { findUserByEmailSimple } from "~/cypher/mutate/user/findUserByEmail";
import { generateSecureToken } from "~/lib/auth/secureToken";
import { encodeUserData } from "~/lib/auth/userDataEncoder";
import { getUserEmailFromSession } from "~/server/session/getUserEmailFromSession";

export async function GET({ request }: APIEvent) {
  try {
    const url = new URL(request.url);
    const targetSubdomain = url.searchParams.get("subdomain");
    const targetDomain = url.searchParams.get("domain");
    
    if (!targetSubdomain && !targetDomain) {
      return new Response(JSON.stringify({ error: "Missing subdomain or domain parameter" }), {
        headers: { "Content-Type": "application/json" },
        status: 400
      });
    }

    const { dbSession } = await getDBSessionForSubdomain(request);
    const email = await getUserEmailFromSession();
    const existingUser = await findUserByEmailSimple(dbSession, email);

    if (!existingUser || !existingUser.P.email || !existingUser.P.username || !existingUser.P.uuid) {
      return new Response(JSON.stringify({ error: "Missing user data" }), {
        headers: { "Content-Type": "application/json" },
        status: 400
      });
    }

    const userData = encodeUserData({ 
      email: existingUser.P.email, 
      username: existingUser.P.username, 
      uuid: existingUser.P.uuid 
    });

    // Generate a secure token instead of passing user data directly
    const secureToken = await generateSecureToken(userData, request);

    // Generate the target URL with the token
    const host = request.headers.get("host") || "";
    const parsedDomain = parse(host);
    const protocol = url.protocol;
    
    let autoLoginUrl;
    if (host.includes("localhost")) {
      // For localhost, use port if present
      const port = host.split(":")[1] ? `:${host.split(":")[1]}` : "";
      autoLoginUrl = `${protocol}//localhost${port}/api/auth/auto-login?token=${secureToken}`;
    } else {
      const baseDomain = parsedDomain.domain;
      if (targetDomain) {
        autoLoginUrl = `${protocol}//${targetDomain}/api/auth/auto-login?token=${secureToken}`;
      } else {
        autoLoginUrl = `${protocol}//${targetSubdomain}.${baseDomain}/api/auth/auto-login?token=${secureToken}`;
      }
    }

    return new Response(null, {
      headers: { Location: autoLoginUrl },
      status: 302
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "An unknown error occurred" 
    }), {
      headers: { "Content-Type": "application/json" },
      status: 500
    });
  }
} 