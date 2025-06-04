import type { APIEvent } from "@solidjs/start/server";
import { join } from "path";
import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { handleAPIError } from "~/lib/api/server/apiErrorHandler";
import { createActivityLog } from "~/cypher/mutate/activity/createActivityLog";
import { ensureDirectoryExists } from "~/lib/files/ensureDirectoryExists";

// Import organized functions
import { validateUserAndPermissions } from "./export/validation";
import { fetchComponents } from "./export/component";
import { fetchPages } from "./export/page";
import { writeSchemaToFile } from "./export/utils";
import type { ExportStats } from "./export/types";

export async function GET({ request }: APIEvent) {
  const { dbSession, subDomain } = await getDBSessionForSubdomain(request);

  try {
    // Validate user and permissions
    const user = await validateUserAndPermissions(request, dbSession);

    // Create export directory path
    const exportBasePath = join(process.cwd(), "src", "page_schema");

    // Ensure base export directory exists
    await ensureDirectoryExists(exportBasePath);

    const stats: ExportStats = {
      exportedComponents: [],
      exportedPages: [],
      totalVertices: 0,
      totalEdges: 0,
    };

    // Fetch and export components
    const components = await fetchComponents(dbSession);
    for (const [key, schema] of Object.entries(components)) {
      await writeSchemaToFile(
        exportBasePath,
        subDomain,
        "components",
        key,
        schema,
      );
      stats.exportedComponents.push(key);
      stats.totalVertices += schema.vertexes.length;
      stats.totalEdges += schema.edges.length;
    }

    // Fetch and export pages
    const pages = await fetchPages(dbSession);
    for (const [key, schema] of Object.entries(pages)) {
      await writeSchemaToFile(exportBasePath, subDomain, "pages", key, schema);
      stats.exportedPages.push(key);
      stats.totalVertices += schema.vertexes.length;
      stats.totalEdges += schema.edges.length;
    }

    // Log the export activity
    const tx = dbSession.beginTransaction();
    try {
      await createActivityLog(
        tx,
        "schema_export",
        "Schema",
        subDomain,
        user.P.email,
        `Exported ${stats.exportedComponents.length} components and ${stats.exportedPages.length} pages for subdomain: ${subDomain}. Total vertices: ${stats.totalVertices}, Total edges: ${stats.totalEdges}`,
      );
      await tx.commit();
    } catch (error) {
      await tx.rollback();
      throw error;
    }

    return {
      success: true,
      message: `Successfully exported ${stats.exportedComponents.length} components and ${stats.exportedPages.length} pages`,
      exportPath: join(exportBasePath, subDomain),
      details: {
        subdomain: subDomain,
        exportedComponents: stats.exportedComponents,
        exportedPages: stats.exportedPages,
        totalVertices: stats.totalVertices,
        totalEdges: stats.totalEdges,
      },
    };
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
