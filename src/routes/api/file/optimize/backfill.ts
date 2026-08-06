import type { APIEvent } from "@solidjs/start/server";

import { checkRole } from "~/cypher/permissions/isPermission";
import { SYSTEM_ROLES } from "~/cypher/permissions/type/types";
import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { APIError, handleAPIError } from "~/lib/api/server/apiErrorHandler";
import { looksLikeImageMime } from "~/lib/files/imageOptimizationConfig";
import { patchFileMetadata } from "~/lib/files/patchFileMetadata";
import { getUserFromSession } from "~/server/auth/session/getUserFromSession";
import { enqueueImageOptimization } from "~/server/queue/imageOptimizationQueue";

/**
 * Admin-triggered backfill: queue optimization for image Files that are not ready.
 * Idempotent — skips Files already status=ready with variantsJson.
 */
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

    const result = await dbSession.run(
      `
      MATCH (f:File)
      WHERE (
        (f.mimeType IS NOT NULL AND f.mimeType STARTS WITH 'image/')
        OR toLower(coalesce(f.fileName, '')) ENDS WITH '.jpg'
        OR toLower(coalesce(f.fileName, '')) ENDS WITH '.jpeg'
        OR toLower(coalesce(f.fileName, '')) ENDS WITH '.png'
        OR toLower(coalesce(f.fileName, '')) ENDS WITH '.gif'
        OR toLower(coalesce(f.fileName, '')) ENDS WITH '.webp'
        OR toLower(coalesce(f.fileName, '')) ENDS WITH '.avif'
        OR toLower(coalesce(f.fileName, '')) ENDS WITH '.tif'
        OR toLower(coalesce(f.fileName, '')) ENDS WITH '.tiff'
        OR toLower(coalesce(f.fileName, '')) ENDS WITH '.bmp'
      )
      AND (
        f.status IS NULL
        OR f.status <> 'ready'
        OR f.variantsJson IS NULL
        OR f.variantsJson = ''
        OR f.variantsJson = '{}'
      )
      RETURN elementId(f) AS fileId,
             f.optimizationGeneration AS generation,
             f.mimeType AS mimeType,
             f.status AS status
      LIMIT 2000
      `,
    );

    let queued = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const record of result.records) {
      const fileId = String(record.get("fileId") || "");
      if (!fileId) {
        skipped += 1;
        continue;
      }
      const currentGeneration = Number(record.get("generation")) || 0;
      const generation = currentGeneration > 0 ? currentGeneration : 1;

      try {
        await patchFileMetadata(dbSession, fileId, {
          status: "processing",
          optimizationGeneration: generation,
          optimizationError: null,
        });

        const enqueueResult = await enqueueImageOptimization({
          fileId,
          subDomain,
          generation,
        });

        if (enqueueResult.ok) {
          queued += 1;
        } else {
          skipped += 1;
          errors.push(`${fileId}: ${enqueueResult.error}`);
          await patchFileMetadata(dbSession, fileId, {
            status: "failed",
            optimizationError: String(enqueueResult.error).slice(0, 1000),
          });
        }
      } catch (e) {
        skipped += 1;
        const msg = e instanceof Error ? e.message : String(e);
        errors.push(`${fileId}: ${msg}`);
      }
    }

    return {
      success: true,
      queued,
      skipped,
      total: result.records.length,
      message: `Queued ${queued} image(s) for optimization${skipped ? ` (${skipped} skipped)` : ""}`,
      errors: errors.slice(0, 20),
      mimeHint: looksLikeImageMime("image/jpeg"),
    };
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
