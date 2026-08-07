import type { ServerResult } from "~/cypher/types/ServerResult";
import { stripVertexAdjacency } from "~/lib/graph/transfer/stripVertexAdjacency";
import type { Vertex } from "~/lib/graph/type/vertex";

const VERTEX_LABELS_KEEPING_UPDATED_AT = new Set([
  "Page",
  "Component",
  "EmailTemplate",
  "Theme",
  "Function",
]);

/** Attr P keys used only in the page designer or server fetch planning — not at render time. */
const PAGE_BUILDER_ATTR_DESIGNER_ONLY_KEYS = ["layerName"] as const;

function shouldKeepVertexUpdatedAt(vertex: Vertex): boolean {
  return (
    vertex.L?.some((label) => VERTEX_LABELS_KEEPING_UPDATED_AT.has(label)) ??
    false
  );
}

function isPageBuilderAttr(vertex: Vertex): boolean {
  if (!(vertex.L?.includes("Attr") && vertex.P)) {
    return false;
  }

  return true;
}

function stripEmptyEdgeProperties(graph: NonNullable<ServerResult["graph"]>) {
  for (const edge of Object.values(graph.edges || {})) {
    if (!edge) {
      continue;
    }
    if (edge.P && Object.keys(edge.P).length === 0) {
      delete (edge as { P?: typeof edge.P }).P;
    }
  }
}

export function stripGraphTimestamps(graph?: ServerResult["graph"]) {
  if (!graph) {
    return;
  }

  for (const vertex of Object.values(graph.vertexes || {})) {
    if (!vertex?.P) {
      continue;
    }
    delete vertex.P.createdAt;
    if (!shouldKeepVertexUpdatedAt(vertex)) {
      delete vertex.P.updatedAt;
    }
  }

  for (const edge of Object.values(graph.edges || {})) {
    if (!edge?.P) {
      continue;
    }
    delete edge.P.createdAt;
    delete edge.P.updatedAt;
  }

  stripEmptyEdgeProperties(graph);
}

export function stripDesignerAttrProperties(graph?: ServerResult["graph"]) {
  if (!graph) {
    return;
  }

  for (const vertex of Object.values(graph.vertexes || {})) {
    if (!isPageBuilderAttr(vertex)) {
      continue;
    }

    for (const key of PAGE_BUILDER_ATTR_DESIGNER_ONLY_KEYS) {
      delete vertex.P[key];
    }
  }
}

const ATTR_CODE_KEYS = ["props", "css", "fns"] as const;

/**
 * Shrink Attr code strings without touching spaces inside literals:
 * trim trailing line whitespace and collapse runs of blank lines.
 */
export function compactAttrCodeStrings(graph?: ServerResult["graph"]) {
  if (!graph?.vertexes) {
    return;
  }

  for (const vertex of Object.values(graph.vertexes)) {
    if (!(isPageBuilderAttr(vertex) && vertex.P)) {
      continue;
    }
    for (const key of ATTR_CODE_KEYS) {
      const value = vertex.P[key];
      if (typeof value === "string" && value.length > 0) {
        vertex.P[key] = value
          .split("\n")
          .map((line) => line.trimEnd())
          .join("\n")
          .replace(/\n{3,}/g, "\n\n")
          .trim();
      }
    }
  }
}

export function prepareGraphForWireTransfer(
  graph?: ServerResult["graph"],
  options?: { isDesignMode?: boolean },
) {
  if (!graph) {
    return;
  }

  stripGraphTimestamps(graph);

  if (!options?.isDesignMode) {
    stripDesignerAttrProperties(graph);
    compactAttrCodeStrings(graph);
  }

  stripVertexAdjacency(graph);
}

export function mergeGraphs(results: ServerResult[]): ServerResult | undefined {
  if (results.length === 0) {
    return undefined;
  }

  if (results.length === 1) {
    const { graph } = results[0];
    if (!graph) {
      return undefined;
    }
    stripVertexAdjacency(graph);
    return { graph };
  }

  const merged: ServerResult = {
    graph: { vertexes: {}, edges: {} },
  };

  for (const result of results) {
    if (result.graph?.vertexes) {
      Object.assign(merged.graph!.vertexes, result.graph.vertexes);
    }
    if (result.graph?.edges) {
      Object.assign(merged.graph!.edges, result.graph.edges);
    }
  }

  stripVertexAdjacency(merged.graph);
  return merged;
}
