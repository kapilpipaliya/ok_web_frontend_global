import { parse } from "tldts";

import { SYSTEM_DB_NAME } from "~/cypher/core/boltConstant";
import { getDriver } from "~/cypher/core/driver";

export async function getSubDomain(host: string) {
  const result = parse(host);
  const { domain, subdomain, hostname } = result;

  if (hostname === "localhost") {
    return { domain, subdomain: "super" };
  }

  const effectiveDomain = domain || hostname;
  // If domain is null, set it to "www"
  const effectiveSubdomain = subdomain || "www";

  if (effectiveSubdomain === "system" || effectiveSubdomain === "admin") {
    return { domain, subdomain: SYSTEM_DB_NAME };
  }
  // If it matches the current domain from env, use system subdomain
  if (effectiveDomain === process.env.DOMAIN) {
    return { domain, subdomain: effectiveSubdomain };
  }

  // Otherwise look up the domain in SubDomain vertex
  const driver = await getDriver();
  const dbSession = driver.session({ database: SYSTEM_DB_NAME });
  if (dbSession) {
    try {
      const query = `
        MATCH (s:SubDomain {domain: $domain})
        RETURN s.key as subdomain
      `;
      const result = await dbSession.run(query, { domain: effectiveSubdomain });

      if (result.records.length > 0) {
        return { domain, subdomain: result.records[0].get("subdomain") };
      }
    } catch (error) {
      console.error("Error looking up domain:", error, effectiveSubdomain);
      throw error;
    }
  }

  // Default to system if no match found
  throw "Error looking up domain";
}
