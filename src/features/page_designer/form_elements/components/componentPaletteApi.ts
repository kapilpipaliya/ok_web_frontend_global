import type { StoreSetter as SetStoreFunction } from "solid-js";

import type { ServerResult } from "~/cypher/types/ServerResult";
import { executeNamedServerFunction } from "~/cypher/get/executeNamedServerFunction";
import { setGraphData } from "~/lib/graph/mutate/core/setGraphData";
import { deleteEdge } from "~/lib/graph/mutate/core/edge/deleteEdge";
import { deleteVertex } from "~/lib/graph/mutate/core/vertex/deleteVertex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

import type { PaletteTreeConfig } from "./componentPaletteConfig";

function applyGraphResult(
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  result: ServerResult,
  options?: { defer?: boolean },
) {
  const apply = () => {
    if (result.graph?.vertexes || result.graph?.edges) {
      setGraphData(graph, setGraph, result.graph, { skipExisting: false });
    }
  };
  if (options?.defer) {
    queueMicrotask(apply);
  } else {
    apply();
  }
}

function sidebarContext(
  config: PaletteTreeConfig,
  extra: Record<string, unknown> = {},
) {
  return {
    parentVertexLabel: config.parentVertexLabel,
    toParentEdgeType: config.toParentEdgeType,
    rootKeys: config.rootKeys,
    tableVertexLabel: config.tableVertexLabel,
    relationshipType: config.relationshipType,
    enableUserScoping: false,
    loadFullTree: config.loadFullTree,
    ...extra,
  };
}

export async function fetchPaletteTree(
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  config: PaletteTreeConfig,
) {
  const result = await executeNamedServerFunction({
    functionName: "getPaletteTreeRoots",
    contextData: sidebarContext(config),
  });
  applyGraphResult(graph, setGraph, result);
  return result;
}

export async function fetchCategoryChildren(
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  config: PaletteTreeConfig,
  parentId: string,
  options?: { defer?: boolean },
) {
  const result = await executeNamedServerFunction({
    functionName: "getPaletteCategoryChildren",
    contextData: sidebarContext(config, { parentId }),
  });
  applyGraphResult(graph, setGraph, result, { defer: options?.defer ?? true });
  return result;
}

export async function savePaletteCategory(
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  config: PaletteTreeConfig,
  params: {
    vertexId?: string | null;
    name: string;
    key: string;
    parentId?: string | null;
    properties?: Record<string, unknown>;
    operation?: "create" | "delete";
  },
) {
  const result = await executeNamedServerFunction({
    functionName: "saveSidebarVertex",
    contextData: sidebarContext(config, {
      operation: params.operation ?? (params.vertexId ? "update" : "create"),
      vertexId: params.vertexId ?? null,
      name: params.name,
      key: params.key,
      parentId: params.parentId,
      properties: params.properties ?? {},
      label: config.label,
    }),
  });
  applyGraphResult(graph, setGraph, result);

  if (result.result?.success && params.parentId) {
    await fetchCategoryChildren(graph, setGraph, config, params.parentId, {
      defer: false,
    });
  }

  return result;
}

export async function movePaletteCategory(
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  config: PaletteTreeConfig,
  categoryId: string,
  newParentId: string | null,
) {
  const result = await executeNamedServerFunction({
    functionName: "moveSidebarItem",
    contextData: sidebarContext(config, {
      categoryId,
      newParentId,
      label: config.label,
    }),
  });
  applyGraphResult(graph, setGraph, result, { defer: true });

  if (result.result?.success && newParentId) {
    await fetchCategoryChildren(graph, setGraph, config, newParentId, {
      defer: false,
    });
  }

  return result;
}

export async function moveContentToCategory(
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  config: PaletteTreeConfig,
  contentIds: string[],
  categoryId: string | null,
) {
  const result = await executeNamedServerFunction({
    functionName: "moveItemsToCategory",
    contextData: {
      contentIds,
      categoryId,
      relationshipType: config.relationshipType,
      categoryLabel: config.parentVertexLabel,
      contentLabel: config.tableVertexLabel,
      enableUserScopingForSidebar: false,
      enableUserScopingForContent: false,
    },
  });
  applyGraphResult(graph, setGraph, result, { defer: true });

  if (result.result?.success && categoryId) {
    await fetchCategoryChildren(graph, setGraph, config, categoryId, {
      defer: false,
    });
  }

  return result;
}

export async function deletePaletteCategory(
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  config: PaletteTreeConfig,
  categoryId: string,
) {
  const vertex = graph.vertexes[categoryId];
  const result = await savePaletteCategory(graph, setGraph, config, {
    vertexId: categoryId,
    name: String(vertex?.P?.name ?? vertex?.P?.key ?? ""),
    key: String(vertex?.P?.key ?? ""),
    operation: "delete",
  });

  if (isPaletteServerSuccess(result)) {
    const edgeIds = new Set<string>();
    if (vertex?.OUT) {
      for (const ids of Object.values(vertex.OUT)) {
        for (const edgeId of ids ?? []) {
          edgeIds.add(edgeId);
        }
      }
    }
    if (vertex?.IN) {
      for (const ids of Object.values(vertex.IN)) {
        for (const edgeId of ids ?? []) {
          edgeIds.add(edgeId);
        }
      }
    }
    for (const edgeId of edgeIds) {
      deleteEdge(0, edgeId, graph, setGraph);
    }
    deleteVertex(0, categoryId, graph, setGraph);
  }

  return result;
}

export async function reorderPaletteSiblings(
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  config: PaletteTreeConfig,
  params: {
    orderedItemIds: string[];
    parentCategoryId: string | null;
    vertexLabel: string;
  },
) {
  const result = await executeNamedServerFunction({
    functionName: "reorderPaletteSiblings",
    contextData: sidebarContext(config, {
      orderedItemIds: params.orderedItemIds,
      parentCategoryId: params.parentCategoryId,
      vertexLabel: params.vertexLabel,
    }),
  });
  if (isPaletteServerSuccess(result)) {
    applyGraphResult(graph, setGraph, result, { defer: true });
  }
  return result;
}

export function isPaletteServerSuccess(result: ServerResult) {
  return !result.error && result.result?.success === true;
}

export function getPaletteServerError(result: ServerResult, fallback: string) {
  if (result.error) return result.error;
  if (typeof result.result?.message === "string" && result.result.message) {
    return result.result.message;
  }
  return fallback;
}
