import type { APIEvent } from "@solidjs/start/dist/server";

import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";

export async function POST({ request }: APIEvent) {
  const { logoImage } = await request.json();
  const { dbSession } = await getDBSessionForSubdomain(request);

  try {
    if (!logoImage) {
      throw new Error("Company logo is required");
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
        { key: `global_setting_${Date.now()}` },
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
      throw new Error("GlobalSetting or file not found");
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
    });
  } catch (error) {
    if (error instanceof Error) {
      return new Response(error.message, { status: 500 });
    }
    return new Response("An unknown error occurred", { status: 500 });
  } finally {
    await dbSession.close();
  }
}
