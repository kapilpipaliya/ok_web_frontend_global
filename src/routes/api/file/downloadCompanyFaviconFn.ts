import type { Session } from "neo4j-driver";
import { redirect } from "@solidjs/router";
import { downloadFileById } from "~/routes/api/file/functions/downloadFileById";

/**
 * Retrieves and downloads the company favicon
 * @param dbSession - Neo4j database session
 * @returns Response object containing the favicon file or an error message
 * @throws APIError if the favicon is not found
 */
export async function downloadCompanyFavicon(
  dbSession: Session,
): Promise<Response> {
  // Query to get the company favicon file ID
  const result = await dbSession.run(`
    MATCH (g:GlobalSetting)-[:CompanyFavicon]->(f:File)
    RETURN elementId(f) as fileId
  `);

  if (result.records.length === 0) {
    // Redirect to default favicon if not found
    return redirect("/favicon.ico");
  }

  const fileId = result.records[0].get("fileId");
  return await downloadFileById(fileId, dbSession);
}
