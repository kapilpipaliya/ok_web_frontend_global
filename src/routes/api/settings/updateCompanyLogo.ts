import type { APIEvent } from "@solidjs/start/server";
import type { Record as Neo4jRecord } from "neo4j-driver";

import {
  convertNodeToJson,
  convertRelationshipToJson,
} from "~/cypher/conversion/convertNodeToJson";
import { updateNodeRelations } from "~/cypher/conversion/updateRelations";
import { createActivityLog } from "~/cypher/mutate/activity/createActivityLog";
import { checkRole } from "~/cypher/permissions/isPermission";
import { SYSTEM_ROLES } from "~/cypher/permissions/type/types";
import { APIError, handleAPIError } from "~/lib/api/server/apiErrorHandler";
import { getUserFromSession } from "~/server/auth/session/getUserFromSession";
import { isShopDatabaseName } from "~/lib/shopify/getDatabaseNameForShop";
import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { enqueueCompanyLogosShopSync } from "~/server/queue/companyLogosShopSyncQueue";
import type { Edge } from "~/lib/graph/type/edge";
import type { Vertex } from "~/lib/graph/type/vertex";

function collectDeletedEdgeIds(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((edgeId) => (edgeId == null ? "" : String(edgeId).trim()))
    .filter((edgeId) => edgeId !== "");
}

function buildCompanyLogoGraph(records: Neo4jRecord[]) {
  const context: {
    nodes: Record<string, Vertex>;
    relationships: Record<string, Edge>;
  } = { nodes: {}, relationships: {} };

  const record = records[0];
  if (!record) {
    return { vertexes: context.nodes, edges: context.relationships };
  }

  const globalSettingNode = record.get("g");
  if (globalSettingNode) {
    const globalSettingVertex = convertNodeToJson(globalSettingNode);
    context.nodes[globalSettingVertex.id] = globalSettingVertex;
  }

  for (const relationshipKey of ["rectR", "squareR", "favR"] as const) {
    const relationshipNode = record.get(relationshipKey);
    if (!relationshipNode) continue;
    const convertedRelationship = convertRelationshipToJson(relationshipNode);
    updateNodeRelations(context.nodes, convertedRelationship);
    context.relationships[convertedRelationship.id] = convertedRelationship;
  }

  for (const fileKey of ["rectLogo", "squareLogo", "favicon"] as const) {
    const fileNode = record.get(fileKey);
    if (!fileNode) continue;
    const fileVertex = convertNodeToJson(fileNode);
    context.nodes[fileVertex.id] = fileVertex;
  }

  return { vertexes: context.nodes, edges: context.relationships };
}

export async function POST({ request }: APIEvent) {
  const { dbSession, subDomain } = await getDBSessionForSubdomain(request);

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
      throw new APIError(
        "At least one company logo or favicon is required",
        400,
      );
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

    const deleteLogoEdgesResult = await dbSession.run(
      `MATCH (g:GlobalSetting)-[r:CompanyRectangularLogo|CompanySquareLogo|CompanyFavicon]->()
       WITH collect(elementId(r)) AS deletedEdgeIds, collect(r) AS relationshipsToDelete
       FOREACH (relationship IN relationshipsToDelete | DELETE relationship)
       RETURN deletedEdgeIds`,
    );
    const deletedEdgeIds = collectDeletedEdgeIds(
      deleteLogoEdgesResult.records[0]?.get("deletedEdgeIds"),
    );

    if (rectangularLogo) {
      await dbSession.run(
        `MATCH (g:GlobalSetting)
         MATCH (f:File) WHERE elementId(f) = $rectangularLogo
         MERGE (g)-[:CompanyRectangularLogo]->(f)`,
        { rectangularLogo },
      );
    }

    if (squareLogo) {
      await dbSession.run(
        `MATCH (g:GlobalSetting)
         MATCH (f:File) WHERE elementId(f) = $squareLogo
         MERGE (g)-[:CompanySquareLogo]->(f)`,
        { squareLogo },
      );
    }

    if (favicon) {
      await dbSession.run(
        `MATCH (g:GlobalSetting)
         MATCH (f:File) WHERE elementId(f) = $favicon
         MERGE (g)-[:CompanyFavicon]->(f)`,
        { favicon },
      );
    }

    const result = await dbSession.run(
      `MATCH (g:GlobalSetting)
       OPTIONAL MATCH (g)-[rectR:CompanyRectangularLogo]->(rectLogo:File)
       OPTIONAL MATCH (g)-[squareR:CompanySquareLogo]->(squareLogo:File)
       OPTIONAL MATCH (g)-[favR:CompanyFavicon]->(favicon:File)
       RETURN g, rectR, rectLogo, squareR, squareLogo, favR, favicon`,
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

    if (!isShopDatabaseName(subDomain)) {
      void enqueueCompanyLogosShopSync(subDomain).catch((err) => {
        console.warn(
          "[Company logos] Failed to enqueue Shopify shop company logos sync:",
          err,
        );
      });
    }

    const graphPayload = buildCompanyLogoGraph(result.records);

    return {
      graph: {
        vertexes: graphPayload.vertexes,
        edges: graphPayload.edges,
        deleted_edges: deletedEdgeIds,
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
