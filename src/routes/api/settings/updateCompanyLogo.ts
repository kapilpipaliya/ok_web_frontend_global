import type { APIEvent } from "@solidjs/start/server";

import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";
import { APIError, handleAPIError } from "~/lib/api/apiErrorHandler";

export async function POST({ request }: APIEvent) {
  const { dbSession } = await getDBSessionForSubdomain(request);

  try {
    const { logoImage } = await request.json();
    if (!logoImage) {
      throw new APIError("Company logo is required", 400);
    }

    // First ensure GlobalSetting exists
    const existingGlobalSetting = await dbSession.run(
      "MATCH (g:GlobalSetting) RETURN g",
    );

    if (existingGlobalSetting.records.length === 0) {
      await dbSession.run(
        `CREATE (g:GlobalSetting {
          key: $key,
          createdAt: datetime(),
          updatedAt: datetime()
        })`,
        { key: "Default" },
      );
    }

    // First check if the relationship already exists
    const existingResult = await dbSession.run(
      `MATCH (g:GlobalSetting)-[r:CompanyLogo]->(f:File)
       WHERE elementId(f) = $logoImage
       RETURN r`,
      { logoImage },
    );

    // If relationship exists, delete other relationships and return
    if (existingResult.records.length > 0) {
      await dbSession.run(
        `MATCH (g:GlobalSetting)-[r:CompanyLogo]->(f:File)
         WHERE elementId(f) <> $logoImage
         DELETE r`,
        { logoImage },
      );
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
      });
    }

    // Delete all existing CompanyLogo relationships
    await dbSession.run(
      `MATCH (g:GlobalSetting)-[r:CompanyLogo]->(f:File)
       DELETE r`,
    );

    // Create new relationship
    const result = await dbSession.run(
      `MATCH (g:GlobalSetting)
       MATCH (f:File) WHERE elementId(f) = $logoImage
       MERGE (g)-[:CompanyLogo]->(f)
       RETURN g, f`,
      { logoImage },
    );

    if (!(result.records[0]?.get("g") && result.records[0]?.get("f"))) {
      throw new APIError("GlobalSetting or file not found", 404);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
    });
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
