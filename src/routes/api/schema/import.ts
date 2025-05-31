import type { APIEvent } from "@solidjs/start/server";

import { getWebsiteSchemasSync } from "~/page_schema/loader";
import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { checkRole } from "~/cypher/permissions/isPermission";
import { SYSTEM_ROLES } from "~/cypher/permissions/type/types";
import { APIError, handleAPIError } from "~/lib/api/server/apiErrorHandler";
import { getUserFromSession } from "~/server/auth/session/getUserFromSession";
import { createActivityLog } from "~/cypher/mutate/activity/createActivityLog";
import { createAppState } from "~/createAppState";
import { mutateData } from "~/cypher/mutate/mutate_data/mutateData";
import { commitTxn } from "~/lib/graph/transaction/core/commitTxn";
import { importGraphStructure } from "~/lib/graph/import/importGraphStructure";
import { processImportedGraph } from "~/lib/graph/import/processImportedGraph";

export async function GET({ request }: APIEvent) {
  const { dbSession, subDomain } = await getDBSessionForSubdomain(request);

  try {
    // Check authentication
    const user = await getUserFromSession(request);
    if (!user) {
      throw new APIError("User not found", 404);
    }

    // Check admin permissions
    const isAdmin = await checkRole(SYSTEM_ROLES.ADMIN, dbSession, user);
    if (!isAdmin) {
      throw new APIError("Unauthorized. Admin access required.", 403);
    }

    // Use subdomain as website name
    const websiteName = subDomain;

    // Load schemas for the specific website
    const websiteSchemas = getWebsiteSchemasSync(websiteName);

    if (!websiteSchemas.components && !websiteSchemas.pages) {
      throw new APIError(`No schemas found for website: ${websiteName}`, 404);
    }

    // Track all imported items
    const importedItems: string[] = [];
    let totalVertices = 0;
    let totalEdges = 0;

    // Create a new graph state
    const [graph, setGraph] = createAppState();
    const tx = dbSession.beginTransaction();
    try {
      // Process components
      if (websiteSchemas.components) {
        for (const [componentKey, schema] of Object.entries(
          websiteSchemas.components,
        )) {
          // Import the schema into the graph
          const importResult = importGraphStructure(schema, graph, setGraph);

          // Process the imported graph to create proper structure
          processImportedGraph(
            importResult,
            graph,
            setGraph,
            "Component",
            componentKey,
          );

          // Commit the transaction to get the mutation data
          const commitData = commitTxn(importResult.metaTxnId, graph);
          if (!commitData) {
            throw new APIError(
              `Failed to prepare data for component: ${componentKey}`,
              500,
            );
          }

          // Save to database
          await mutateData(commitData, tx);

          importedItems.push(`Component: ${componentKey}`);
          totalVertices += (schema.vertexes || []).length;
          totalEdges += (schema.edges || []).length;
        }
      }

      // Process pages
      if (websiteSchemas.pages) {
        for (const [pageKey, schema] of Object.entries(websiteSchemas.pages)) {
          // Import the schema into the graph
          const importResult = importGraphStructure(schema, graph, setGraph);

          // Process the imported graph to create proper structure
          processImportedGraph(importResult, graph, setGraph, "Page", pageKey);

          // Commit the transaction to get the mutation data
          const commitData = commitTxn(importResult.metaTxnId, graph);
          if (!commitData) {
            throw new APIError(
              `Failed to prepare data for page: ${pageKey}`,
              500,
            );
          }

          // Save to database
          await mutateData(commitData, tx);

          importedItems.push(`Page: ${pageKey}`);
          totalVertices += (schema.vertexes || []).length;
          totalEdges += (schema.edges || []).length;
        }
      }

      // Log the import activity
      await createActivityLog(
        tx,
        "schema_import",
        "Schema",
        websiteName,
        user.P.email,
        `Imported ${importedItems.length} schemas from website: ${websiteName}. Total vertices: ${totalVertices}, Total edges: ${totalEdges}`,
      );

      await tx.commit();

      return {
        success: true,
        message: `Successfully imported ${importedItems.length} schemas from website: ${websiteName}`,
        details: {
          website: websiteName,
          importedItems,
          totalVertices,
          totalEdges,
          components: Object.keys(websiteSchemas.components || {}).length,
          pages: Object.keys(websiteSchemas.pages || {}).length,
        },
      };
    } catch (error: unknown) {
      await tx.rollback();
      throw error;
    } finally {
      await tx.close();
    }
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
