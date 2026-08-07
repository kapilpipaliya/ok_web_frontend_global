import type { APIEvent } from "@solidjs/start/server";

import { checkRole } from "~/cypher/permissions/isPermission";
import { SYSTEM_ROLES } from "~/cypher/permissions/type/types";
import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { APIError, handleAPIError } from "~/lib/api/server/apiErrorHandler";
import {
  CURRENT_MEDIA_PROCESSING_VERSION,
  detectMediaType,
} from "~/lib/files/mediaOptimizationConfig";
import { patchFileMetadata } from "~/lib/files/patchFileMetadata";
import { getUserFromSession } from "~/server/auth/session/getUserFromSession";
import { enqueueMediaOptimization } from "~/server/queue/mediaOptimizationQueue";

/**
 * Admin-triggered backfill: queue optimization for image/video Files that are
 * not ready, missing variants, or stamped below CURRENT_MEDIA_PROCESSING_VERSION.
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
        (f.mimeType IS NOT NULL AND (f.mimeType STARTS WITH 'image/' OR f.mimeType STARTS WITH 'video/'))
        OR toLower(coalesce(f.fileName, '')) ENDS WITH '.jpg'
        OR toLower(coalesce(f.fileName, '')) ENDS WITH '.jpeg'
        OR toLower(coalesce(f.fileName, '')) ENDS WITH '.png'
        OR toLower(coalesce(f.fileName, '')) ENDS WITH '.gif'
        OR toLower(coalesce(f.fileName, '')) ENDS WITH '.webp'
        OR toLower(coalesce(f.fileName, '')) ENDS WITH '.avif'
        OR toLower(coalesce(f.fileName, '')) ENDS WITH '.tif'
        OR toLower(coalesce(f.fileName, '')) ENDS WITH '.tiff'
        OR toLower(coalesce(f.fileName, '')) ENDS WITH '.bmp'
        OR toLower(coalesce(f.fileName, '')) ENDS WITH '.mp4'
        OR toLower(coalesce(f.fileName, '')) ENDS WITH '.mov'
        OR toLower(coalesce(f.fileName, '')) ENDS WITH '.webm'
        OR toLower(coalesce(f.fileName, '')) ENDS WITH '.mkv'
        OR toLower(coalesce(f.fileName, '')) ENDS WITH '.m4v'
        OR toLower(coalesce(f.fileName, '')) ENDS WITH '.avi'
        OR f.mediaType IN ['image', 'video']
      )
      AND (
        f.status IS NULL
        OR f.status <> 'ready'
        OR f.variantsJson IS NULL
        OR f.variantsJson = ''
        OR f.variantsJson = '{}'
        OR coalesce(f.processingVersion, 0) < $currentVersion
      )
      RETURN elementId(f) AS fileId,
             f.optimizationGeneration AS generation,
             f.mimeType AS mimeType,
             f.fileName AS fileName,
             f.mediaType AS mediaType,
             f.status AS status,
             f.processingVersion AS processingVersion
      LIMIT 2000
      `,
      { currentVersion: CURRENT_MEDIA_PROCESSING_VERSION },
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
      const mimeType = record.get("mimeType");
      const fileName = record.get("fileName");
      const existingMediaType = record.get("mediaType");
      const mediaType =
        existingMediaType === "image" || existingMediaType === "video"
          ? existingMediaType
          : detectMediaType({
              mimeType: mimeType == null ? null : String(mimeType),
              fileName: fileName == null ? null : String(fileName),
            });

      if (!mediaType) {
        skipped += 1;
        continue;
      }

      try {
        await patchFileMetadata(dbSession, fileId, {
          status: "processing",
          mediaType,
          optimizationGeneration: generation,
          processingVersion: 0,
          optimizationError: null,
        });

        const enqueueResult = await enqueueMediaOptimization({
          fileId,
          subDomain,
          generation,
          mediaType,
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
      currentProcessingVersion: CURRENT_MEDIA_PROCESSING_VERSION,
      message: `Queued ${queued} media file(s) for optimization${skipped ? ` (${skipped} skipped)` : ""} (processingVersion < ${CURRENT_MEDIA_PROCESSING_VERSION} or incomplete)`,
      errors: errors.slice(0, 20),
    };
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
