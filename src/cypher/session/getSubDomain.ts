import { parse } from "tldts";

import { SYSTEM_DB_NAME } from "~/cypher/core/boltConstant";
import { getDriver } from "~/cypher/core/driver";

export async function getSubDomain(host: string) {
  const result = parse(host);
  const { domain, subdomain } = result;

  // If domain is null, set it to "super"
  const effectiveDomain = domain || "localhost";

  // If it matches the current domain from env, use system subdomain
  if (effectiveDomain === process.env.DOMAIN) {
    if (!subdomain || subdomain === "www" || subdomain === "system") {
      return { domain, subdomain: SYSTEM_DB_NAME };
    }
    return { domain, subdomain};
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
      const result = await dbSession.run(query, { domain: effectiveDomain });

      if (result.records.length > 0) {
        return { domain, subdomain: result.records[0].get("subdomain") };
      }
    } catch (error) {
      console.error("Error looking up domain:", error);
      throw error;
    }
  }

  // Default to system if no match found
  throw "Error looking up domain";
}
