import type { Session } from "neo4j-driver";

import type { MultipartPart } from "~/lib/http/multipart";

import path from "node:path";

import { createActivityLog } from "~/cypher/mutate/activity/createActivityLog";
import type { EvalExpressionContext } from "~/cypher/types/EvalExpressionContext";
import { calculateChecksum } from "~/lib/files/calculateChecksum";
import { deleteVariantDiskArtifacts } from "~/lib/files/deleteFileDiskArtifacts";
import { ensureDirectoryExists } from "~/lib/files/ensureDirectoryExists";
import { getBaseDir } from "~/lib/files/getBaseDir";
import {
  detectMediaType,
  looksLikeVideoMime,
} from "~/lib/files/mediaOptimizationConfig";
import { patchFileMetadata } from "~/lib/files/patchFileMetadata";
import { probeImage } from "~/lib/files/processImageVariants";
import { probeVideo } from "~/lib/files/processVideoVariants";
import { saveFileToDisk } from "~/lib/files/saveFileToDisk";
import type { Vertex } from "~/lib/graph/type/vertex";
import { getFileMetadataById } from "~/routes/api/file/functions/functions/getFileMetadataById";
import {
  cancelMediaOptimizationJob,
  enqueueMediaOptimization,
} from "~/server/queue/mediaOptimizationQueue";

export async function replaceFiles(
  request: Request,
  data: MultipartPart[],
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

  await cancelMediaOptimizationJob(subDomain, fileId);
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
  const imageProbe = await probeImage(file.data);
  const maybeVideo =
    looksLikeVideoMime(mimeType) ||
    (!imageProbe && /\.(mp4|mov|webm|mkv|m4v|avi)$/i.test(file.filename));
  const videoProbe = maybeVideo ? await probeVideo(filePath) : null;
  const mediaType = detectMediaType({
    mimeType,
    fileName: file.filename,
    isImageProbe: Boolean(imageProbe),
    isVideoProbe: Boolean(videoProbe),
  });
  const needsProcessing = mediaType === "image" || mediaType === "video";
  const generation =
    (Number(oldFileMetadata.P.optimizationGeneration) || 0) + 1;

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
    status: needsProcessing ? "processing" : "ready",
    optimizationGeneration: generation,
    processingVersion: 0,
    variantsJson: "{}",
    optimizationError: null,
    optimizedAt: null,
    mediaType: mediaType || null,
    duration: null,
    fps: null,
    bitrate: null,
    codec: null,
    audioCodec: null,
  };

  if (imageProbe) {
    patch.width = imageProbe.width;
    patch.height = imageProbe.height;
    patch.aspectRatio = Number(
      (imageProbe.width / imageProbe.height).toFixed(6),
    );
  } else if (videoProbe) {
    patch.width = videoProbe.width;
    patch.height = videoProbe.height;
    patch.aspectRatio = Number(
      (videoProbe.width / videoProbe.height).toFixed(6),
    );
    patch.duration = videoProbe.duration;
    patch.fps = videoProbe.fps;
    patch.bitrate = videoProbe.bitrate;
    patch.codec = videoProbe.codec;
    patch.audioCodec = videoProbe.audioCodec;
  } else {
    patch.width = null;
    patch.height = null;
    patch.aspectRatio = null;
  }

  const updated = await patchFileMetadata(neo4jSession, fileId, patch);

  if (needsProcessing && mediaType) {
    const enqueueResult = await enqueueMediaOptimization({
      fileId,
      subDomain,
      generation,
      mediaType,
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
