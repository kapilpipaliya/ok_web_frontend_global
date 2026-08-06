import fs from "node:fs";
import path from "node:path";

import sharp from "sharp";

import type { ImageOptimizationConfig } from "~/lib/files/imageOptimizationConfig";
import {
  type VariantPathMap,
  serializeVariantsJson,
  variantPath,
} from "~/lib/files/imageVariantPaths";

export type ProcessImageVariantsResult = {
  width: number;
  height: number;
  aspectRatio: number;
  variants: VariantPathMap;
  variantsJson: string;
  sizes: Partial<Record<string, number>>;
};

/**
 * Generate optimized WebP variants next to the original.
 * Always auto-rotates via Sharp `.rotate()` when enabled.
 * Metadata is stripped by default (Sharp default unless withMetadata).
 */
export async function processImageVariants(
  originalPath: string,
  config: ImageOptimizationConfig,
): Promise<ProcessImageVariantsResult> {
  if (!fs.existsSync(originalPath)) {
    throw new Error(`Original file not found: ${originalPath}`);
  }

  let pipeline = sharp(originalPath, { failOn: "error" });
  if (config.autoRotate) {
    pipeline = pipeline.rotate();
  }

  const metadata = await pipeline.metadata();
  const width = metadata.width || 0;
  const height = metadata.height || 0;
  if (!width || !height) {
    throw new Error("Unable to read image dimensions");
  }

  const aspectRatio = Number((width / height).toFixed(6));
  const useWebp = config.formats.includes("webp");
  if (!useWebp) {
    throw new Error("Only webp format is currently supported");
  }

  const variantsToGenerate =
    width < config.minWidthToVariant
      ? [...config.variants.filter((v) => v.name === "thumb")]
      : config.variants.filter((v) => width > v.width);

  // Tiny images always get a thumb even when width <= thumb target.
  if (
    width < config.minWidthToVariant &&
    !variantsToGenerate.some((v) => v.name === "thumb")
  ) {
    const thumbDef = config.variants.find((v) => v.name === "thumb");
    if (thumbDef) variantsToGenerate.push(thumbDef);
  }

  const variants: VariantPathMap = {};
  const sizes: Partial<Record<string, number>> = {};

  for (const def of variantsToGenerate) {
    const outputPath = variantPath(originalPath, def.name, "webp");
    ensureSiblingPath(originalPath, outputPath);

    let variantPipeline = sharp(originalPath, { failOn: "error" });
    if (config.autoRotate) {
      variantPipeline = variantPipeline.rotate();
    }
    if (!config.stripMetadata) {
      variantPipeline = variantPipeline.withMetadata();
    }

    await variantPipeline
      .resize({
        width: def.width,
        withoutEnlargement: true,
      })
      .webp({
        quality: config.quality,
        effort: config.effort,
      })
      .toFile(outputPath);

    variants[def.name] = outputPath;
    try {
      sizes[def.name] = fs.statSync(outputPath).size;
    } catch {
      // ignore size read failures
    }
  }

  return {
    width,
    height,
    aspectRatio,
    variants,
    variantsJson: serializeVariantsJson(variants),
    sizes,
  };
}

function ensureSiblingPath(originalPath: string, outputPath: string): void {
  const originalDir = path.resolve(path.dirname(originalPath));
  const outputDir = path.resolve(path.dirname(outputPath));
  if (outputDir !== originalDir) {
    throw new Error("Variant path must stay in the original directory");
  }
  if (path.resolve(outputPath) === path.resolve(originalPath)) {
    throw new Error("Variant path must not overwrite the original");
  }
}

/**
 * Quick check: can Sharp read this buffer/path as an image?
 */
export async function probeImage(
  input: string | Buffer,
): Promise<{ width: number; height: number; format?: string } | null> {
  try {
    const meta = await sharp(input, { failOn: "error" }).metadata();
    if (!meta.width || !meta.height) return null;
    return {
      width: meta.width,
      height: meta.height,
      format: meta.format,
    };
  } catch {
    return null;
  }
}
