import { parse } from "tldts";

import { ADMIN_DB_NAME } from "~/cypher/core/boltConstant";
import { getDriver } from "~/cypher/core/driver";
import { hostnameMatchesConfiguredAppDomain } from "~/lib/envDomains";

/**
 * In-process cache for custom-domain -> subdomain lookups. These hit Neo4j
 * otherwise, and getSubDomain runs multiple times per request (middleware,
 * server functions). Domain mappings change rarely; a short TTL is enough.
 */
const DOMAIN_CACHE_TTL_MS = 60_000;
const domainCache = new Map<
  string,
  { value: { domain: string | null; subdomain: string }; expiresAt: number }
>();

export async function getSubDomain(host: string) {
  const result = parse(host);
  const { domain, subdomain, hostname } = result;

  if (hostname === "localhost") {
    return { domain, subdomain: "admin" };
  }

  const effectiveSubdomain = subdomain;

  // Handle nip.io domains (e.g., subdomain.192.168.1.1.nip.io)
  // if (effectiveDomain === "nip.io") {
  //   // Extract the first part before the IP address as subdomain
  //   const firstPart = hostname?.split(".")[0];
  //   return { domain: effectiveDomain, subdomain: firstPart || "www" };
  // }

  if (effectiveSubdomain === "admin") {
    return { domain, subdomain: ADMIN_DB_NAME };
  }
  if (
    hostnameMatchesConfiguredAppDomain(domain) ||
    hostnameMatchesConfiguredAppDomain(hostname)
  ) {
    return { domain, subdomain: effectiveSubdomain || "www" };
  }

  // Otherwise look up the domain in SubDomain vertex (cached in-process)
  const cacheKey = hostname || domain || host;
  const cached = domainCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  // First try hostname, then domain if hostname not found
  const driver = await getDriver();
  const dbSession = driver.session({ database: ADMIN_DB_NAME });

  try {
    const query = `
      MATCH (s:SubDomain {domain: $domain})
      RETURN s.key as subdomain
    `;

    // First, try to find hostname in database
    if (hostname) {
      const result = await dbSession.run(query, { domain: hostname });
      if (result.records.length > 0) {
        const value = {
          domain,
          subdomain: result.records[0].get("subdomain"),
        };
        domainCache.set(cacheKey, {
          value,
          expiresAt: Date.now() + DOMAIN_CACHE_TTL_MS,
        });
        return value;
      }
    }

    // If hostname not found and domain exists and is different, try domain
    if (domain && domain !== hostname) {
      const result = await dbSession.run(query, { domain });
      if (result.records.length > 0) {
        const value = {
          domain,
          subdomain: result.records[0].get("subdomain"),
        };
        domainCache.set(cacheKey, {
          value,
          expiresAt: Date.now() + DOMAIN_CACHE_TTL_MS,
        });
        return value;
      }
    }

    console.error(
      "Domain not found in SubDomain vertices:",
      hostname || domain,
    );
    throw new Error(`Domain not found: ${hostname || domain}`);
  } catch (error) {
    console.error("Error looking up domain:", error, hostname || domain);
    throw error;
  } finally {
    await dbSession.close();
  }
}
