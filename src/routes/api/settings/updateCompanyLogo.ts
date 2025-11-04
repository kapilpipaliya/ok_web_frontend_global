import type { APIEvent } from "@solidjs/start/server";

import { convertNodeToJson } from "~/cypher/conversion/convertNodeToJson";
import { createActivityLog } from "~/cypher/mutate/activity/createActivityLog";
import { checkRole } from "~/cypher/permissions/isPermission";
import { SYSTEM_ROLES } from "~/cypher/permissions/type/types";
import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { APIError, handleAPIError } from "~/lib/api/server/apiErrorHandler";
import { getUserFromSession } from "~/server/auth/session/getUserFromSession";

export async function POST({ request }: APIEvent) {
  const { dbSession } = await getDBSessionForSubdomain(request);

  try {
    const user = await getUserFromSession(request);

    if (!user) {
      throw new APIError("User not found", 404);
    }

    const isAdmin = await checkRole(SYSTEM_ROLES.ADMIN, dbSession, user);

    if (!isAdmin) {
      throw new APIError("Unauthorized. Admin access required.", 403);
    }

    const { rectangularLogo, squareLogo, favicon } = await request.json();
    if (!(rectangularLogo || squareLogo || favicon)) {
      throw new APIError("At least one company logo or favicon is required", 400);
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

    // Delete all existing CompanySquareLogo relationships
    await dbSession.run(
      `MATCH (g:GlobalSetting)-[r:CompanySquareLogo]->(f:File)
       DELETE r`,
    );

    // Handle Square logo
    if (squareLogo) {
      // Create new relationship
      await dbSession.run(
        `MATCH (g:GlobalSetting)
         MATCH (f:File) WHERE elementId(f) = $squareLogo
         MERGE (g)-[:CompanySquareLogo]->(f)`,
        { squareLogo },
      );
    }

    // Delete all existing CompanyFavicon relationships
    await dbSession.run(
      `MATCH (g:GlobalSetting)-[r:CompanyFavicon]->(f:File)
       DELETE r`,
    );

    // Handle favicon
    if (favicon) {
      // Create new relationship
      await dbSession.run(
        `MATCH (g:GlobalSetting)
         MATCH (f:File) WHERE elementId(f) = $favicon
         MERGE (g)-[:CompanyFavicon]->(f)`,
        { favicon },
      );
    }

    // Get updated GlobalSetting with all logos
    const result = await dbSession.run(
      `MATCH (g:GlobalSetting)
       OPTIONAL MATCH (g)-[:CompanyRectangularLogo]->(rectLogo:File)
       OPTIONAL MATCH (g)-[:CompanySquareLogo]->(squareLogo:File)
       OPTIONAL MATCH (g)-[:CompanyFavicon]->(favicon:File)
       RETURN g, rectLogo, squareLogo, favicon`,
    );

    if (!result.records[0]?.get("g")) {
      throw new APIError("GlobalSetting not found", 404);
    }

    const updatedGlobalSetting = convertNodeToJson(result.records[0].get("g"));
    const rectangularLogoFile = result.records[0].get("rectLogo")
      ? convertNodeToJson(result.records[0].get("rectLogo"))
      : null;
    const squareLogoFile = result.records[0].get("squareLogo")
      ? convertNodeToJson(result.records[0].get("squareLogo"))
      : null;
    const faviconFile = result.records[0].get("favicon")
      ? convertNodeToJson(result.records[0].get("favicon"))
      : null;

    // Log company logo updates
    const logDetails = [];
    if (rectangularLogo) {
      logDetails.push(
        `rectangular logo: ${rectangularLogoFile?.P.fileName} (${rectangularLogoFile?.P.contentType})`,
      );
    }
    if (squareLogo) {
      logDetails.push(
        `Square logo: ${squareLogoFile?.P.fileName} (${squareLogoFile?.P.contentType})`,
      );
    }
    if (favicon) {
      logDetails.push(
        `Favicon: ${faviconFile?.P.fileName} (${faviconFile?.P.contentType})`,
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

    if (squareLogoFile) {
      vertexes[squareLogoFile.id] = squareLogoFile;
    }

    if (faviconFile) {
      vertexes[faviconFile.id] = faviconFile;
    }

    return {
      graph: {
        edges: {},
        vertexes: vertexes,
      },
      result: {
        globalSetting: updatedGlobalSetting,
        rectangularLogoFile,
        squareLogoFile,
        faviconFile,
      },
    };
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
