import { Session } from "neo4j-driver";
import tld from "tldts";

import { SYSTEM_DB_NAME } from "~/cypher/boltConstant";

export async function getSubDomain(host: string, dbSession?: Session) {
  const { domain, subdomain } = tld.parse(host);
  
  // If it matches the current domain from env, use system subdomain
  if ((domain || "localhost") === process.env.DOMAIN) {
    if (!subdomain || subdomain === "www" || subdomain === "system") {
      return SYSTEM_DB_NAME;
    }
    return subdomain;
  }

  // Otherwise look up the domain in SubDomain vertex
  if (dbSession) {
    try {
      const query = `
        MATCH (s:SubDomain {domain: $domain})
        RETURN s.key as subdomain
      `;
      const result = await dbSession.run(query, { domain });
      
      if (result.records.length > 0) {
        return result.records[0].get('subdomain');
      }
    } catch (error) {
      console.error("Error looking up domain:", error);
      throw error;
    }
  }

  // Default to system if no match found
  throw "Error looking up domain";
}
