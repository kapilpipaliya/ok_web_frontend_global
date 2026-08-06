import { parseMediaVariantsJsonProp } from "~/lib/files/videoVariantPaths";
import { isSafeMediaVariantKey } from "~/lib/files/videoOptimizationConfig";

export type PublicVideoSource = {
  name: string;
  url: string;
  width?: number;
  type: string;
};

export type PublicVideoPayload = {
  ready: boolean;
  status: string;
  posterUrl: string;
  sources: PublicVideoSource[];
  duration?: number;
  width?: number;
  height?: number;
  aspectRatio?: number;
  placeholder: boolean;
};

function downloadBaseUrl(fileName: string): string {
  return `/api/file/download/${encodeURIComponent(fileName)}`;
}

function variantUrl(fileName: string, variant: string): string {
  return `${downloadBaseUrl(fileName)}?variant=${encodeURIComponent(variant)}`;
}

/**
 * Build public video payload from a File vertex's properties.
 * Does not expose the original while processing/failed.
 */
export function buildPublicVideoPayload(
  fileProps: Record<string, unknown> | null | undefined,
  options?: {
    preferredVariant?: string;
  },
): PublicVideoPayload | null {
  const fileName =
    fileProps?.fileName != null ? String(fileProps.fileName).trim() : "";
  if (!fileName) return null;

  const status =
    fileProps?.status != null ? String(fileProps.status).trim() : "";
  const ready = status === "ready";
  const variants = parseMediaVariantsJsonProp(fileProps?.variantsJson);
  const width = Number(fileProps?.width);
  const height = Number(fileProps?.height);
  const aspectRatio = Number(fileProps?.aspectRatio);
  const duration = Number(fileProps?.duration);

  const baseMeta = {
    width: Number.isFinite(width) && width > 0 ? width : undefined,
    height: Number.isFinite(height) && height > 0 ? height : undefined,
    aspectRatio:
      Number.isFinite(aspectRatio) && aspectRatio > 0
        ? aspectRatio
        : undefined,
    duration:
      Number.isFinite(duration) && duration > 0 ? duration : undefined,
  };

  if (!ready) {
    return {
      ready: false,
      status: status || "processing",
      posterUrl: "",
      sources: [],
      ...baseMeta,
      placeholder: true,
    };
  }

  const posterUrl = variants.poster
    ? variantUrl(fileName, "poster")
    : "";

  const sources: PublicVideoSource[] = Object.keys(variants)
    .filter((name) => name !== "poster" && isSafeMediaVariantKey(name))
    .sort((a, b) => {
      const wa = Number(a) || 0;
      const wb = Number(b) || 0;
      return wa - wb;
    })
    .map((name) => ({
      name,
      url: variantUrl(fileName, name),
      width: Number(name) || undefined,
      type: "video/mp4",
    }));

  if (!posterUrl && sources.length === 0) {
    return {
      ready: false,
      status: status || "ready",
      posterUrl: "",
      sources: [],
      ...baseMeta,
      placeholder: true,
    };
  }

  const preferred = options?.preferredVariant;
  if (preferred && sources.some((s) => s.name === preferred)) {
    sources.sort((a, b) =>
      a.name === preferred ? -1 : b.name === preferred ? 1 : 0,
    );
  }

  return {
    ready: true,
    status: "ready",
    posterUrl,
    sources,
    ...baseMeta,
    placeholder: false,
  };
}
