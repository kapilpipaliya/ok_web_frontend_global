import type { APIEvent } from "@solidjs/start/server";

import { convertNodeToJson } from "~/cypher/conversion/convertNodeToJson";
import { ADMIN_DB_NAME } from "~/cypher/core/boltConstant";
import { getDriver } from "~/cypher/core/driver";

/**
 * Gets the domain to use for email links.
 * Checks SubDomain vertex for custom domain, falls back to request host.
 */
export async function getEmailDomain(
  request: APIEvent["request"],
  subDomain: string,
): Promise<string> {
  const driver = await getDriver();
  const adminSession = driver.session({ database: ADMIN_DB_NAME });

  try {
    const subDomainResult = await adminSession.run(
      "MATCH (s:SubDomain {key: $subDomain}) RETURN s",
      { subDomain },
    );

    const subDomainVertex =
      subDomainResult.records.length > 0
        ? convertNodeToJson(subDomainResult.records[0].get("s"))
        : null;

    // Use custom domain if available, otherwise fall back to request host
    return subDomainVertex?.P?.domain || request.headers.get("host") || "";
  } finally {
    await adminSession.close();
  }
}
