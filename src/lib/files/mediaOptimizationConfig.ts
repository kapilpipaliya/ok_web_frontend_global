import type { Session, Transaction } from "neo4j-driver";

import { convertNodeToJson } from "~/cypher/conversion/convertNodeToJson";
import type { Vertex } from "~/lib/graph/type/vertex";
import {
  DEFAULT_IMAGE_OPTIMIZATION_CONFIG,
  DEFAULT_IMAGE_SETTING_PROPS,
  parseImageOptimizationConfig,
  type ImageOptimizationConfig,
  validateImageSettingProps,
} from "~/lib/files/imageOptimizationConfig";
import {
  DEFAULT_VIDEO_OPTIMIZATION_CONFIG,
  DEFAULT_VIDEO_SETTING_PROPS,
  parseVideoOptimizationConfig,
  type VideoOptimizationConfig,
  validateVideoSettingProps,
} from "~/lib/files/videoOptimizationConfig";

export const MEDIA_SETTING_TYPE = "media";
export const LEGACY_IMAGE_SETTING_TYPE = "image";

/**
 * Pipeline schema version stamped on File after successful optimization.
 * Bump when encoding contract changes (formats, ladder, quality defaults, poster rules),
 * then run Media Settings → Backfill to requeue stale Files.
 */
export const CURRENT_MEDIA_PROCESSING_VERSION = 1;

export type MediaType = "image" | "video";

export type MediaOptimizationConfig = {
  image: ImageOptimizationConfig;
  video: VideoOptimizationConfig;
};

export const DEFAULT_MEDIA_SETTING_PROPS: Record<string, unknown> = {
  ...DEFAULT_IMAGE_SETTING_PROPS,
  ...DEFAULT_VIDEO_SETTING_PROPS,
};

export function parseMediaOptimizationConfig(
  props: Record<string, unknown> | null | undefined,
): MediaOptimizationConfig {
  return {
    image: parseImageOptimizationConfig(props),
    video: parseVideoOptimizationConfig(props),
  };
}

export function validateMediaSettingProps(
  data: Record<string, unknown>,
): Record<string, string> | null {
  const imageErrors = validateImageSettingProps(data);
  const videoErrors = validateVideoSettingProps(data);
  if (!imageErrors && !videoErrors) return null;
  return { ...(imageErrors || {}), ...(videoErrors || {}) };
}

/**
 * Load Setting {type:"media"}, falling back to legacy {type:"image"}.
 */
export async function loadMediaOptimizationConfig(
  session: Session | Transaction,
): Promise<{ config: MediaOptimizationConfig; setting: Vertex | null }> {
  let result = await session.run(
    `MATCH (s:Setting {type: $type})
     RETURN s
     LIMIT 1`,
    { type: MEDIA_SETTING_TYPE },
  );

  if (result.records.length === 0) {
    result = await session.run(
      `MATCH (s:Setting {type: $type})
       RETURN s
       LIMIT 1`,
      { type: LEGACY_IMAGE_SETTING_TYPE },
    );
  }

  if (result.records.length === 0) {
    return {
      config: {
        image: { ...DEFAULT_IMAGE_OPTIMIZATION_CONFIG },
        video: { ...DEFAULT_VIDEO_OPTIMIZATION_CONFIG },
      },
      setting: null,
    };
  }

  const setting = convertNodeToJson(result.records[0].get("s")) as Vertex;
  return {
    config: parseMediaOptimizationConfig(setting.P),
    setting,
  };
}

/** @deprecated Prefer loadMediaOptimizationConfig */
export async function loadImageOptimizationConfig(
  session: Session | Transaction,
): Promise<{ config: ImageOptimizationConfig; setting: Vertex | null }> {
  const { config, setting } = await loadMediaOptimizationConfig(session);
  return { config: config.image, setting };
}

export function looksLikeVideoMime(mimeType?: string | null): boolean {
  if (!mimeType) return false;
  return String(mimeType).toLowerCase().startsWith("video/");
}

export function looksLikeVideoFileName(fileName?: string | null): boolean {
  if (!fileName) return false;
  const lower = String(fileName).toLowerCase();
  return (
    lower.endsWith(".mp4") ||
    lower.endsWith(".mov") ||
    lower.endsWith(".webm") ||
    lower.endsWith(".mkv") ||
    lower.endsWith(".m4v") ||
    lower.endsWith(".avi")
  );
}

export function detectMediaType(options: {
  mimeType?: string | null;
  fileName?: string | null;
  isImageProbe?: boolean;
  isVideoProbe?: boolean;
}): MediaType | null {
  if (options.isImageProbe) return "image";
  if (options.isVideoProbe) return "video";
  if (
    options.mimeType &&
    String(options.mimeType).toLowerCase().startsWith("image/")
  ) {
    return "image";
  }
  if (looksLikeVideoMime(options.mimeType) || looksLikeVideoFileName(options.fileName)) {
    return "video";
  }
  return null;
}
