import type {Session} from "neo4j-driver";
import {APIError} from "~/lib/api/server/apiErrorHandler";
import {downloadFile} from "~/routes/api/file/functions/downloadFile";

/**
 * Retrieves and downloads the company square logo
 * @param dbSession - Neo4j database session
 * @returns Response object containing the logo file or an error message
 * @throws APIError if the logo is not found
 */
export async function downloadCompanySquareLogo(dbSession: Session): Promise<Response> {
  // Query to get the company logo file ID
  const result = await dbSession.run(`
    MATCH (g:GlobalSetting)-[:CompanySquareLogo]->(f:File)
    RETURN elementId(f) as fileId
  `);

  if (result.records.length === 0) {
    throw new APIError("Company logo not found", 404);
  }

  const fileId = result.records[0].get("fileId");
  return await downloadFile(fileId, dbSession);
}