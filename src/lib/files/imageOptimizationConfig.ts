import type { Session, Transaction } from "neo4j-driver";

import { convertNodeToJson } from "~/cypher/conversion/convertNodeToJson";
import type { Vertex } from "~/lib/graph/type/vertex";

export const IMAGE_SETTING_TYPE = "image";

export const ALLOWED_VARIANT_NAMES = [
  "thumb",
  "small",
  "medium",
  "large",
] as const;

export type ImageVariantName = (typeof ALLOWED_VARIANT_NAMES)[number];

export type ImageVariantDef = {
  name: ImageVariantName;
  width: number;
};

export type ImageOptimizationConfig = {
  enabled: boolean;
  keepOriginal: boolean;
  formats: string[];
  quality: number;
  effort: number;
  minWidthToVariant: number;
  autoRotate: boolean;
  stripMetadata: boolean;
  variants: ImageVariantDef[];
};

export const DEFAULT_IMAGE_VARIANTS: ImageVariantDef[] = [
  { name: "thumb", width: 200 },
  { name: "small", width: 500 },
  { name: "medium", width: 1000 },
  { name: "large", width: 1600 },
];

export const DEFAULT_IMAGE_OPTIMIZATION_CONFIG: ImageOptimizationConfig = {
  enabled: true,
  keepOriginal: true,
  formats: ["webp"],
  quality: 80,
  effort: 4,
  minWidthToVariant: 300,
  autoRotate: true,
  stripMetadata: true,
  variants: DEFAULT_IMAGE_VARIANTS,
};

export const DEFAULT_IMAGE_SETTING_PROPS: Record<string, unknown> = {
  imageOptimizationEnabled: true,
  keepOriginal: true,
  formats: "webp",
  quality: 80,
  effort: 4,
  minWidthToVariant: 300,
  autoRotate: true,
  stripMetadata: true,
  variantsJson: JSON.stringify(DEFAULT_IMAGE_VARIANTS),
};

export function isAllowedVariantName(name: string): name is ImageVariantName {
  return (ALLOWED_VARIANT_NAMES as readonly string[]).includes(name);
}

export function parseVariantsJson(raw: unknown): ImageVariantDef[] {
  let parsed: unknown = raw;
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed) return [...DEFAULT_IMAGE_VARIANTS];
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      throw new Error("variantsJson must be valid JSON");
    }
  }
  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error("variantsJson must be a non-empty array");
  }

  const variants: ImageVariantDef[] = [];
  const seen = new Set<string>();
  for (const entry of parsed) {
    const name =
      entry?.name != null ? String(entry.name).trim().toLowerCase() : "";
    const width = Number(entry?.width);
    if (!isAllowedVariantName(name)) {
      throw new Error(
        `Invalid variant name "${name}". Allowed: ${ALLOWED_VARIANT_NAMES.join(", ")}`,
      );
    }
    if (!Number.isFinite(width) || width < 1) {
      throw new Error(`Invalid width for variant "${name}"`);
    }
    if (seen.has(name)) {
      throw new Error(`Duplicate variant name "${name}"`);
    }
    seen.add(name);
    variants.push({ name, width: Math.round(width) });
  }
  return variants;
}

export function parseImageOptimizationConfig(
  props: Record<string, unknown> | null | undefined,
): ImageOptimizationConfig {
  const p = props || {};
  const enabled =
    p.imageOptimizationEnabled === undefined
      ? DEFAULT_IMAGE_OPTIMIZATION_CONFIG.enabled
      : Boolean(p.imageOptimizationEnabled);
  const keepOriginal =
    p.keepOriginal === undefined
      ? DEFAULT_IMAGE_OPTIMIZATION_CONFIG.keepOriginal
      : Boolean(p.keepOriginal);
  const autoRotate =
    p.autoRotate === undefined
      ? DEFAULT_IMAGE_OPTIMIZATION_CONFIG.autoRotate
      : Boolean(p.autoRotate);
  const stripMetadata =
    p.stripMetadata === undefined
      ? DEFAULT_IMAGE_OPTIMIZATION_CONFIG.stripMetadata
      : Boolean(p.stripMetadata);

  const formatsRaw =
    p.formats != null ? String(p.formats).trim() : "webp";
  const formats = formatsRaw
    .split(",")
    .map((f) => f.trim().toLowerCase())
    .filter(Boolean);
  if (formats.length === 0) formats.push("webp");

  const quality = Number(p.quality);
  const effort = Number(p.effort);
  const minWidthToVariant = Number(p.minWidthToVariant);

  let variants: ImageVariantDef[];
  try {
    variants =
      p.variantsJson != null
        ? parseVariantsJson(p.variantsJson)
        : [...DEFAULT_IMAGE_VARIANTS];
  } catch {
    variants = [...DEFAULT_IMAGE_VARIANTS];
  }

  return {
    enabled,
    keepOriginal,
    formats,
    quality:
      Number.isFinite(quality) && quality >= 1 && quality <= 100
        ? Math.round(quality)
        : DEFAULT_IMAGE_OPTIMIZATION_CONFIG.quality,
    effort:
      Number.isFinite(effort) && effort >= 0 && effort <= 6
        ? Math.round(effort)
        : DEFAULT_IMAGE_OPTIMIZATION_CONFIG.effort,
    minWidthToVariant:
      Number.isFinite(minWidthToVariant) && minWidthToVariant >= 0
        ? Math.round(minWidthToVariant)
        : DEFAULT_IMAGE_OPTIMIZATION_CONFIG.minWidthToVariant,
    autoRotate,
    stripMetadata,
    variants,
  };
}

export function validateImageSettingProps(
  data: Record<string, unknown>,
): Record<string, string> | null {
  const errors: Record<string, string> = {};

  if (data.quality != null && data.quality !== "") {
    const quality = Number(data.quality);
    if (!Number.isFinite(quality) || quality < 1 || quality > 100) {
      errors.quality = "Quality must be between 1 and 100";
    }
  }

  if (data.effort != null && data.effort !== "") {
    const effort = Number(data.effort);
    if (!Number.isFinite(effort) || effort < 0 || effort > 6) {
      errors.effort = "Effort must be between 0 and 6";
    }
  }

  if (data.minWidthToVariant != null && data.minWidthToVariant !== "") {
    const minWidth = Number(data.minWidthToVariant);
    if (!Number.isFinite(minWidth) || minWidth < 0) {
      errors.minWidthToVariant = "Minimum width must be 0 or greater";
    }
  }

  if (data.variantsJson != null && String(data.variantsJson).trim() !== "") {
    try {
      parseVariantsJson(data.variantsJson);
    } catch (e) {
      errors.variantsJson =
        e instanceof Error ? e.message : "Invalid variants JSON";
    }
  }

  return Object.keys(errors).length > 0 ? errors : null;
}

/**
 * Load Setting {type:"image"} from the current tenant DB and parse config.
 * Falls back to defaults when missing.
 * Prefer loadMediaOptimizationConfig for image+video.
 */
export async function loadImageOptimizationConfig(
  session: Session | Transaction,
): Promise<{ config: ImageOptimizationConfig; setting: Vertex | null }> {
  // Prefer media Setting, then legacy image Setting
  let result = await session.run(
    `MATCH (s:Setting {type: $type})
     RETURN s
     LIMIT 1`,
    { type: "media" },
  );
  if (result.records.length === 0) {
    result = await session.run(
      `MATCH (s:Setting {type: $type})
       RETURN s
       LIMIT 1`,
      { type: IMAGE_SETTING_TYPE },
    );
  }

  if (result.records.length === 0) {
    return { config: { ...DEFAULT_IMAGE_OPTIMIZATION_CONFIG }, setting: null };
  }

  const setting = convertNodeToJson(result.records[0].get("s")) as Vertex;
  return {
    config: parseImageOptimizationConfig(setting.P),
    setting,
  };
}

export function looksLikeImageMime(mimeType?: string | null): boolean {
  if (!mimeType) return false;
  return String(mimeType).toLowerCase().startsWith("image/");
}
