import type { APIEvent } from "@solidjs/start/server";

import { convertNodeToJson } from "~/cypher/convertNodeToJson";
import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";
import { createActivityLog } from "~/cypher/mutate/activity/createActivityLog";
import { checkRole } from "~/cypher/permissions/checkPermission";
import { SYSTEM_ROLES } from "~/cypher/permissions/types";
import { APIError, handleAPIError } from "~/lib/api/apiErrorHandler";
import { getUserFromSession } from "~/server/auth/session/getUserFromSession";

export async function POST({ request }: APIEvent) {
  const { dbSession } = await getDBSessionForSubdomain(request);

  try {
    const user = await getUserFromSession(request);

    if (!user) {
      throw new APIError("User not found", 404);
    }

    const isAdmin = await checkRole(
      request,
      SYSTEM_ROLES.ADMIN,
      dbSession,
      user,
    );

    if (!isAdmin) {
      throw new APIError("Unauthorized. Admin access required.", 403);
    }

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

    const updatedGlobalSetting = convertNodeToJson(result.records[0].get("g"));
    const updatedFile = convertNodeToJson(result.records[0].get("f"));

    // Log company logo update
    await createActivityLog(
      dbSession,
      "company_logo_update",
      "GlobalSetting",
      updatedGlobalSetting.id,
      user.P.email,
      `Company logo updated to ${updatedFile.P.fileName} (${updatedFile.P.contentType})`,
    );

    return {
      graph: {
        edges: {},
        vertexes: {
          [updatedFile.id]: updatedFile,
          [updatedGlobalSetting.id]: updatedGlobalSetting,
        },
      },
      result: {
        file: updatedFile,
        globalSetting: updatedGlobalSetting,
      },
    };
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
