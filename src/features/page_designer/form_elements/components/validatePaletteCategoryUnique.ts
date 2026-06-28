import type { GraphInterface } from "~/lib/graph/context/GraphInterface";
import type { Id } from "~/lib/graph/type/id";

import type { PaletteTreeConfig } from "./componentPaletteConfig";
import { isPaletteRootCategory } from "./componentPaletteUtils";

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function getCategoryDisplayName(vertex: { P?: Record<string, unknown> }) {
  return String(vertex.P?.name ?? vertex.P?.title ?? "").trim();
}

export function validatePaletteCategoryUnique(
  graph: GraphInterface,
  config: PaletteTreeConfig,
  params: {
    name: string;
    key: string;
    excludeVertexId?: Id | null;
  },
): { valid: true } | { valid: false; message: string } {
  const nameNorm = normalize(params.name);
  const keyNorm = normalize(params.key);
  const categoryIds = graph.vertexLabelIdMap?.[config.parentVertexLabel] ?? [];

  for (const id of categoryIds) {
    const vertex = graph.vertexes[id];
    if (!vertex) {
      continue;
    }
    if (isPaletteRootCategory(vertex, config)) {
      continue;
    }
    if (params.excludeVertexId && vertex.id === params.excludeVertexId) {
      continue;
    }

    const existingName = normalize(getCategoryDisplayName(vertex));
    const existingKey = normalize(String(vertex.P?.key ?? ""));

    if (nameNorm && existingName === nameNorm) {
      return {
        valid: false,
        message: "A category with this name already exists",
      };
    }
    if (keyNorm && existingKey === keyNorm) {
      return {
        valid: false,
        message: "A category with this key already exists",
      };
    }
  }

  return { valid: true };
}
