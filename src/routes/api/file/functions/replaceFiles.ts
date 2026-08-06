import type { MultiPartData } from "h3";
import type { Session } from "neo4j-driver";

import path from "node:path";

import { createActivityLog } from "~/cypher/mutate/activity/createActivityLog";
import type { EvalExpressionContext } from "~/cypher/types/EvalExpressionContext";
import { calculateChecksum } from "~/lib/files/calculateChecksum";
import { deleteVariantDiskArtifacts } from "~/lib/files/deleteFileDiskArtifacts";
import { ensureDirectoryExists } from "~/lib/files/ensureDirectoryExists";
import { getBaseDir } from "~/lib/files/getBaseDir";
import { looksLikeImageMime } from "~/lib/files/imageOptimizationConfig";
import { patchFileMetadata } from "~/lib/files/patchFileMetadata";
import { probeImage } from "~/lib/files/processImageVariants";
import { saveFileToDisk } from "~/lib/files/saveFileToDisk";
import type { Vertex } from "~/lib/graph/type/vertex";
import { getFileMetadataById } from "~/routes/api/file/functions/functions/getFileMetadataById";
import {
  cancelImageOptimizationJob,
  enqueueImageOptimization,
} from "~/server/queue/imageOptimizationQueue";

export async function replaceFiles(
  request: Request,
  data: MultiPartData[],
  neo4jSession: Session,
  subDomain: string,
  user: Vertex,
) {
  const query = new URL(request.url).searchParams;
  const fileId = query.get("fileId");
  if (!fileId) {
    return { error: "fileId is required" };
  }
  if (data.length > 1) {
    return { error: "Only one file is allowed to be replaced" };
  }

  const oldFileMetadata = await getFileMetadataById(neo4jSession, fileId);
  if (!oldFileMetadata) {
    return { error: "File metadata not found for the provided fileId" };
  }

  const file = data[0];
  if (!file?.filename) {
    return { error: "File data is required" };
  }

  await cancelImageOptimizationJob(subDomain, fileId);
  await deleteVariantDiskArtifacts(oldFileMetadata.P);

  const currentDate = new Date().toISOString();
  const oldDir =
    oldFileMetadata.P?.filePath != null
      ? path.dirname(String(oldFileMetadata.P.filePath))
      : "";
  let userDir = oldDir;
  if (!userDir || userDir.trim() === "") {
    const [year, month, day] = currentDate.split("T")[0].split("-");
    userDir = path.join(getBaseDir(), subDomain, year, month, day);
  }

  ensureDirectoryExists(userDir);

  const { ext, name } = path.parse(file.filename);
  const newVersion = (Number(oldFileMetadata.P.version) || 0) + 1;
  const newFilename = `${name}_v${newVersion}_${currentDate}${ext}`;
  const filePath = saveFileToDisk(userDir, newFilename, file.data);
  const fileSize = file.data.length;
  const mimeType = file.type;
  const checksum = calculateChecksum(file.data);
  const probe = await probeImage(file.data);
  const isImage = Boolean(probe) || looksLikeImageMime(mimeType);
  const generation =
    (Number(oldFileMetadata.P.optimizationGeneration) || 0) + 1;

  // Remove old original after writing the new one (if different path)
  const oldPath =
    oldFileMetadata.P?.filePath != null
      ? String(oldFileMetadata.P.filePath)
      : "";
  if (oldPath && path.resolve(oldPath) !== path.resolve(filePath)) {
    try {
      const fs = await import("node:fs/promises");
      await fs.unlink(oldPath);
    } catch {
      // ignore
    }
  }

  const patch: Record<string, unknown> = {
    checksum,
    fileName: newFilename,
    filePath,
    fileSize,
    mimeType,
    originalFileName: file.filename,
    subDomain,
    version: newVersion,
    status: isImage ? "processing" : "ready",
    optimizationGeneration: generation,
    variantsJson: "{}",
    optimizationError: null,
    optimizedAt: null,
  };

  if (probe) {
    patch.width = probe.width;
    patch.height = probe.height;
    patch.aspectRatio = Number((probe.width / probe.height).toFixed(6));
  } else {
    patch.width = null;
    patch.height = null;
    patch.aspectRatio = null;
  }

  const updated = await patchFileMetadata(neo4jSession, fileId, patch);

  if (isImage) {
    const enqueueResult = await enqueueImageOptimization({
      fileId,
      subDomain,
      generation,
    });
    if (!enqueueResult.ok) {
      await patchFileMetadata(neo4jSession, fileId, {
        status: "failed",
        optimizationError: String(enqueueResult.error).slice(0, 1000),
      });
    }
  }

  const context: EvalExpressionContext = {
    nodes: {},
    relationships: {},
  };
  if (updated) {
    context.nodes[updated.id] = updated;
  }

  await createActivityLog(
    neo4jSession,
    "file_replace",
    "File",
    fileId,
    user.P.email,
    `File replaced: ${oldFileMetadata.P.fileName} -> ${file.filename}`,
  );

  return {
    graph: {
      edges: context.relationships,
      vertexes: context.nodes,
    },
    result: updated ? [updated] : [],
  };
}
