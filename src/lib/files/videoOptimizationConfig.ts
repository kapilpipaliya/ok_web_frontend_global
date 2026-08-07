export type VideoOutputDef = {
  name: string;
  width: number;
  bitrate: string;
};

export type VideoOptimizationConfig = {
  enabled: boolean;
  keepOriginal: boolean;
  poster: boolean;
  posterSeekSeconds: number;
  outputs: VideoOutputDef[];
};

export const DEFAULT_VIDEO_OUTPUTS: VideoOutputDef[] = [
  { name: "360", width: 640, bitrate: "800k" },
  { name: "720", width: 1280, bitrate: "2500k" },
  { name: "1080", width: 1920, bitrate: "5000k" },
];

export const DEFAULT_VIDEO_OPTIMIZATION_CONFIG: VideoOptimizationConfig = {
  enabled: true,
  keepOriginal: true,
  poster: true,
  posterSeekSeconds: 2,
  outputs: DEFAULT_VIDEO_OUTPUTS,
};

export const DEFAULT_VIDEO_SETTING_PROPS: Record<string, unknown> = {
  videoOptimizationEnabled: true,
  videoKeepOriginal: true,
  videoPoster: true,
  videoPosterSeekSeconds: 2,
  videoOutputsJson: JSON.stringify(DEFAULT_VIDEO_OUTPUTS),
};

const BITRATE_RE = /^\d+(\.\d+)?[kKmM]?$/;

/**
 * Safe variant key: alphanumeric starting char, optional _- , max 32.
 * Covers video ladder names (360, 720) and poster.
 */
export function isSafeMediaVariantKey(name: string): boolean {
  return /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,31}$/.test(name);
}

export function parseVideoOutputsJson(raw: unknown): VideoOutputDef[] {
  let parsed: unknown = raw;
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed) return [...DEFAULT_VIDEO_OUTPUTS];
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      throw new Error("videoOutputsJson must be valid JSON");
    }
  }
  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error("videoOutputsJson must be a non-empty array");
  }

  const outputs: VideoOutputDef[] = [];
  const seen = new Set<string>();
  for (const entry of parsed) {
    const name =
      entry?.name == null ? "" : String(entry.name).trim().toLowerCase();
    const width = Number(entry?.width);
    const bitrate =
      entry?.bitrate == null ? "" : String(entry.bitrate).trim().toLowerCase();

    if (!isSafeMediaVariantKey(name)) {
      throw new Error(
        `Invalid video output name "${name}". Use alphanumeric keys (e.g. 360, 720).`,
      );
    }
    if (name === "poster") {
      throw new Error('Video output name "poster" is reserved');
    }
    if (!Number.isFinite(width) || width < 16) {
      throw new Error(`Invalid width for video output "${name}"`);
    }
    if (!(bitrate && BITRATE_RE.test(bitrate))) {
      throw new Error(
        `Invalid bitrate for "${name}". Use values like 800k or 2500k`,
      );
    }
    if (seen.has(name)) {
      throw new Error(`Duplicate video output name "${name}"`);
    }
    seen.add(name);
    outputs.push({ name, width: Math.round(width), bitrate });
  }
  return outputs;
}

export function parseVideoOptimizationConfig(
  props: Record<string, unknown> | null | undefined,
): VideoOptimizationConfig {
  const p = props || {};
  const enabled =
    p.videoOptimizationEnabled === undefined
      ? DEFAULT_VIDEO_OPTIMIZATION_CONFIG.enabled
      : Boolean(p.videoOptimizationEnabled);
  const keepOriginal =
    p.videoKeepOriginal === undefined
      ? DEFAULT_VIDEO_OPTIMIZATION_CONFIG.keepOriginal
      : Boolean(p.videoKeepOriginal);
  const poster =
    p.videoPoster === undefined
      ? DEFAULT_VIDEO_OPTIMIZATION_CONFIG.poster
      : Boolean(p.videoPoster);
  const seek = Number(p.videoPosterSeekSeconds);

  let outputs: VideoOutputDef[];
  try {
    outputs =
      p.videoOutputsJson == null
        ? [...DEFAULT_VIDEO_OUTPUTS]
        : parseVideoOutputsJson(p.videoOutputsJson);
  } catch {
    outputs = [...DEFAULT_VIDEO_OUTPUTS];
  }

  return {
    enabled,
    keepOriginal,
    poster,
    posterSeekSeconds:
      Number.isFinite(seek) && seek >= 0
        ? seek
        : DEFAULT_VIDEO_OPTIMIZATION_CONFIG.posterSeekSeconds,
    outputs,
  };
}

export function validateVideoSettingProps(
  data: Record<string, unknown>,
): Record<string, string> | null {
  const errors: Record<string, string> = {};

  if (
    data.videoPosterSeekSeconds != null &&
    data.videoPosterSeekSeconds !== ""
  ) {
    const seek = Number(data.videoPosterSeekSeconds);
    if (!Number.isFinite(seek) || seek < 0) {
      errors.videoPosterSeekSeconds = "Poster seek must be 0 or greater";
    }
  }

  if (
    data.videoOutputsJson != null &&
    String(data.videoOutputsJson).trim() !== ""
  ) {
    try {
      parseVideoOutputsJson(data.videoOutputsJson);
    } catch (e) {
      errors.videoOutputsJson =
        e instanceof Error ? e.message : "Invalid video outputs JSON";
    }
  }

  return Object.keys(errors).length > 0 ? errors : null;
}
