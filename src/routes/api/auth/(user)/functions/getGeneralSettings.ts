import type { Session, Transaction } from "neo4j-driver";

import { convertNodeToJson } from "~/cypher/conversion/convertNodeToJson";

export async function getGeneralSettings(
  dbSession: Session | Transaction,
) {
  try {
    const result = await dbSession.run(
      `MATCH (s:GlobalSetting) RETURN s as settings LIMIT 1`
    );

    const node = result.records[0]?.get("settings");
    return node ? convertNodeToJson(node) : null;
  } catch (error) {
    // If there's an error fetching settings, just return null
    // This ensures auth still works even if settings aren't configured
    console.warn("Failed to fetch general settings:", error);
    return null;
  }
}
