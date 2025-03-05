import type { APIEvent } from "@solidjs/start/server";

import { convertNodeToJson } from "~/cypher/conversion/convertNodeToJson";
import { createActivityLog } from "~/cypher/mutate/activity/createActivityLog";
import { checkRole } from "~/cypher/permissions/checkPermission";
import { SYSTEM_ROLES } from "~/cypher/permissions/types";
import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
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

    const { circularLogo, rectangularLogo } = await request.json();
    if (!(rectangularLogo || circularLogo)) {
      throw new APIError("At least one company logo is required", 400);
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

    // Delete all existing CompanyRectangularLogo relationships
    await dbSession.run(
      `MATCH (g:GlobalSetting)-[r:CompanyRectangularLogo]->(f:File)
       DELETE r`,
    );

    // Handle rectangular logo
    if (rectangularLogo) {
      // Create new relationship
      await dbSession.run(
        `MATCH (g:GlobalSetting)
         MATCH (f:File) WHERE elementId(f) = $rectangularLogo
         MERGE (g)-[:CompanyRectangularLogo]->(f)`,
        { rectangularLogo },
      );
    }

    // Delete all existing CompanyCircularLogo relationships
    await dbSession.run(
      `MATCH (g:GlobalSetting)-[r:CompanyCircularLogo]->(f:File)
       DELETE r`,
    );

    // Handle circular logo
    if (circularLogo) {
      // Create new relationship
      await dbSession.run(
        `MATCH (g:GlobalSetting)
         MATCH (f:File) WHERE elementId(f) = $circularLogo
         MERGE (g)-[:CompanyCircularLogo]->(f)`,
        { circularLogo },
      );
    }

    // Get updated GlobalSetting with both logos
    const result = await dbSession.run(
      `MATCH (g:GlobalSetting)
       OPTIONAL MATCH (g)-[:CompanyRectangularLogo]->(rectLogo:File)
       OPTIONAL MATCH (g)-[:CompanyCircularLogo]->(circLogo:File)
       RETURN g, rectLogo, circLogo`,
    );

    if (!result.records[0]?.get("g")) {
      throw new APIError("GlobalSetting not found", 404);
    }

    const updatedGlobalSetting = convertNodeToJson(result.records[0].get("g"));
    const rectangularLogoFile = result.records[0].get("rectLogo")
      ? convertNodeToJson(result.records[0].get("rectLogo"))
      : null;
    const circularLogoFile = result.records[0].get("circLogo")
      ? convertNodeToJson(result.records[0].get("circLogo"))
      : null;

    // Log company logo updates
    const logDetails = [];
    if (rectangularLogo) {
      logDetails.push(
        `rectangular logo: ${rectangularLogoFile?.P.fileName} (${rectangularLogoFile?.P.contentType})`,
      );
    }
    if (circularLogo) {
      logDetails.push(
        `circular logo: ${circularLogoFile?.P.fileName} (${circularLogoFile?.P.contentType})`,
      );
    }

    await createActivityLog(
      dbSession,
      "company_logo_update",
      "GlobalSetting",
      updatedGlobalSetting.id,
      user.P.email,
      `Company logos updated: ${logDetails.join(", ")}`,
    );

    const vertexes = {
      [updatedGlobalSetting.id]: updatedGlobalSetting,
    };

    if (rectangularLogoFile) {
      vertexes[rectangularLogoFile.id] = rectangularLogoFile;
    }

    if (circularLogoFile) {
      vertexes[circularLogoFile.id] = circularLogoFile;
    }

    return {
      graph: {
        edges: {},
        vertexes: vertexes,
      },
      result: {
        circularLogoFile,
        globalSetting: updatedGlobalSetting,
        rectangularLogoFile,
      },
    };
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
