import {
  isAllowedVariantName,
  type ImageVariantName,
} from "~/lib/files/imageOptimizationConfig";
import {
  VARIANT_WIDTH_HINTS,
  parseVariantsJsonProp,
} from "~/lib/files/imageVariantPaths";

export type PublicImagePayload = {
  ready: boolean;
  status: string;
  url: string;
  srcset: string;
  width?: number;
  height?: number;
  aspectRatio?: number;
  placeholder: boolean;
};

function downloadBaseUrl(fileName: string): string {
  return `/api/file/download/${encodeURIComponent(fileName)}`;
}

function variantUrl(fileName: string, variant: ImageVariantName): string {
  return `${downloadBaseUrl(fileName)}?variant=${encodeURIComponent(variant)}`;
}

/**
 * Build responsive public image payload from a File vertex's properties.
 * Product pages must NOT fall back to the original while processing/failed.
 */
export function buildPublicImagePayload(
  fileProps: Record<string, unknown> | null | undefined,
  options?: {
    preferredVariant?: ImageVariantName;
    sizes?: string;
  },
): PublicImagePayload | null {
  const fileName =
    fileProps?.fileName != null ? String(fileProps.fileName).trim() : "";
  if (!fileName) return null;

  const status =
    fileProps?.status != null ? String(fileProps.status).trim() : "";
  const ready = status === "ready";
  const variants = parseVariantsJsonProp(fileProps?.variantsJson);
  const width = Number(fileProps?.width);
  const height = Number(fileProps?.height);
  const aspectRatio = Number(fileProps?.aspectRatio);

  if (!ready || Object.keys(variants).length === 0) {
    return {
      ready: false,
      status: status || "processing",
      url: "",
      srcset: "",
      width: Number.isFinite(width) && width > 0 ? width : undefined,
      height: Number.isFinite(height) && height > 0 ? height : undefined,
      aspectRatio:
        Number.isFinite(aspectRatio) && aspectRatio > 0
          ? aspectRatio
          : undefined,
      placeholder: true,
    };
  }

  const preferred = options?.preferredVariant || "small";
  const availableNames = (
    Object.keys(variants) as ImageVariantName[]
  ).filter((n) => isAllowedVariantName(n) && variants[n]);

  availableNames.sort(
    (a, b) => (VARIANT_WIDTH_HINTS[a] || 0) - (VARIANT_WIDTH_HINTS[b] || 0),
  );

  const srcset = availableNames
    .map((name) => `${variantUrl(fileName, name)} ${VARIANT_WIDTH_HINTS[name]}w`)
    .join(", ");

  const preferredAvailable = availableNames.includes(preferred)
    ? preferred
    : availableNames[Math.min(1, availableNames.length - 1)] ||
      availableNames[0];

  return {
    ready: true,
    status: "ready",
    url: preferredAvailable ? variantUrl(fileName, preferredAvailable) : "",
    srcset,
    width: Number.isFinite(width) && width > 0 ? width : undefined,
    height: Number.isFinite(height) && height > 0 ? height : undefined,
    aspectRatio:
      Number.isFinite(aspectRatio) && aspectRatio > 0
        ? aspectRatio
        : undefined,
    placeholder: false,
  };
}

export function buildPublicImageUrl(
  fileProps: Record<string, unknown> | null | undefined,
  preferredVariant: ImageVariantName = "small",
): string {
  const payload = buildPublicImagePayload(fileProps, { preferredVariant });
  return payload?.url || "";
}
