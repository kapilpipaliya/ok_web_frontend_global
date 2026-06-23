import { evalExpression } from "~/lib/expression_eval";
import type { SetStoreFunction } from "solid-js/store";

import type { PaletteTreeConfig } from "./componentPaletteConfig";
import {
  getUncategorizedPaletteId,
  isUncategorizedPaletteId,
} from "./componentPaletteConfig";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";
import type { Id } from "~/lib/graph/type/id";
import type { Vertex } from "~/lib/graph/type/vertex";

export function isPaletteCategory(
  vertex: Vertex | undefined,
  config: PaletteTreeConfig,
) {
  return !!vertex?.L?.includes(config.parentVertexLabel);
}

export function isPaletteContent(
  vertex: Vertex | undefined,
  config: PaletteTreeConfig,
) {
  return !!vertex?.L?.includes(config.tableVertexLabel);
}

export function getItemSortName(item: Vertex) {
  return String(
    item?.P?.name ?? item?.P?.label ?? item?.P?.title ?? item?.P?.key ?? "",
  );
}

export function sortPaletteItems(
  items: Vertex[],
  config: PaletteTreeConfig,
) {
  const uncategorizedId = getUncategorizedPaletteId(config);
  return [...items].sort((a, b) => {
    const isAUncat = a.id === uncategorizedId;
    const isBUncat = b.id === uncategorizedId;
    if (isAUncat && !isBUncat) return -1;
    if (!isAUncat && isBUncat) return 1;
    const orderA = Number(a.P?.displayOrder ?? 0);
    const orderB = Number(b.P?.displayOrder ?? 0);
    if (orderA !== orderB) return orderA - orderB;
    return getItemSortName(a).localeCompare(getItemSortName(b));
  });
}

export function getCategoryContentCount(
  graph: GraphInterface,
  categoryId: Id,
  config: PaletteTreeConfig,
) {
  const { parentVertexLabel, toParentEdgeType, tableVertexLabel } = config;

  if (isUncategorizedPaletteId(config, categoryId)) {
    const contentIds = graph.vertexLabelIdMap?.[tableVertexLabel] || [];
    return contentIds.filter((id) => {
      const vertex = graph.vertexes[id];
      if (!vertex) return false;
      const outEdges = vertex.OUT?.[toParentEdgeType];
      return !outEdges || outEdges.length === 0;
    }).length;
  }

  const contentIds = graph.vertexLabelIdMap?.[tableVertexLabel] || [];
  if (contentIds.length > 0) {
    return contentIds.filter((id) => {
      const vertex = graph.vertexes[id];
      if (!vertex) return false;
      const outEdges = vertex.OUT?.[toParentEdgeType];
      if (!outEdges?.length) return false;
      const parentId = graph.edges[outEdges[0]]?.E;
      return parentId === categoryId;
    }).length;
  }

  const stored = graph.vertexes[categoryId]?.P?.contentCount;
  return typeof stored === "number" ? stored : 0;
}

export function categoryHasChildren(
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  categoryId: Id,
  config: PaletteTreeConfig,
) {
  return (
    getCategoryChildren(graph, setGraph, categoryId, config).length > 0 ||
    getContentChildrenForCategory(graph, setGraph, categoryId, config).length > 0
  );
}

export function getCategoryChildren(
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  parentId: Id,
  config: PaletteTreeConfig,
) {
  const parentVertex = graph.vertexes[parentId];
  if (!parentVertex) return [];

  const children =
    evalExpression(`<-${config.toParentEdgeType}`, {
      graph,
      setGraph,
      vertexes: [parentVertex],
    }) || [];

  return sortPaletteItems(
    children.filter((child: Vertex) => isPaletteCategory(child, config)),
    config,
  );
}

export function getContentChildrenForCategory(
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  parentId: Id,
  config: PaletteTreeConfig,
) {
  const { toParentEdgeType, tableVertexLabel } = config;

  if (isUncategorizedPaletteId(config, parentId)) {
    const contentIds = graph.vertexLabelIdMap?.[tableVertexLabel] || [];
    const uncategorized = contentIds
      .map((id) => graph.vertexes[id])
      .filter((vertex) => {
        if (!vertex) return false;
        const outEdges = vertex.OUT?.[toParentEdgeType];
        return !outEdges || outEdges.length === 0;
      });
    return sortPaletteItems(uncategorized, config);
  }

  const parentVertex = graph.vertexes[parentId];
  if (!parentVertex) return [];

  const children =
    evalExpression(`<-${toParentEdgeType}`, {
      graph,
      setGraph,
      vertexes: [parentVertex],
    }) || [];

  return sortPaletteItems(
    children.filter((child: Vertex) => isPaletteContent(child, config)),
    config,
  );
}

export function getPaletteRootItems(
  graph: GraphInterface,
  config: PaletteTreeConfig,
) {
  const { parentVertexLabel, toParentEdgeType } = config;
  const vertexes = graph.vertexes;
  const labelIds = graph.vertexLabelIdMap?.[parentVertexLabel];
  const candidateIds = Array.isArray(labelIds)
    ? labelIds
    : Object.keys(vertexes).filter((id) =>
        vertexes[id]?.L?.includes(parentVertexLabel),
      );

  const syntheticUncat = getUncategorizedPaletteId(config);
  const rootItems = candidateIds
    .filter(
      (id) =>
        vertexes[id] != null &&
        (id === syntheticUncat ||
          !vertexes[id].OUT?.[toParentEdgeType]?.length),
    )
    .map((id) => vertexes[id])
    .filter(Boolean) as Vertex[];

  const hasUncategorized = rootItems.some((item) => item.id === syntheticUncat);
  if (!hasUncategorized) {
    const uncategorizedCount = getCategoryContentCount(
      graph,
      syntheticUncat,
      config,
    );
    if (uncategorizedCount > 0) {
      rootItems.unshift({
        id: syntheticUncat,
        L: [parentVertexLabel],
        P: {
          key: syntheticUncat,
          name: "Uncategorized",
        },
        IN: {},
        OUT: {},
      } as Vertex);
    }
  }

  return sortPaletteItems(rootItems, config);
}

export function filterPaletteTreeVertex(
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  item: Vertex,
  query: string,
  config: PaletteTreeConfig,
): { match: boolean; matchedChildren: boolean } {
  if (!query.trim()) return { match: true, matchedChildren: false };
  const q = query.trim().toLowerCase();
  const searchable = getItemSortName(item).toLowerCase();
  if (searchable.includes(q)) return { match: true, matchedChildren: false };

  const categoryChildren = getCategoryChildren(graph, setGraph, item.id, config);
  const contentChildren = getContentChildrenForCategory(
    graph,
    setGraph,
    item.id,
    config,
  );
  const allChildren = [...categoryChildren, ...contentChildren];
  const hasMatchingChild = allChildren.some((child) => {
    const r = filterPaletteTreeVertex(graph, setGraph, child, query, config);
    return r.match || r.matchedChildren;
  });
  return { match: false, matchedChildren: hasMatchingChild };
}

export function getAncestorCategoryIds(
  graph: GraphInterface,
  contentId: Id,
  config: PaletteTreeConfig,
): Id[] {
  const ancestors: Id[] = [];
  let current = graph.vertexes[contentId];
  if (!current) return ancestors;

  const visited = new Set<Id>();
  while (current) {
    const parentEdgeIds = current.OUT?.[config.toParentEdgeType];
    if (!parentEdgeIds?.length) break;
    const parentEdge = graph.edges[parentEdgeIds[0]];
    const parent = parentEdge ? graph.vertexes[parentEdge.E] : undefined;
    if (!parent || visited.has(parent.id)) break;
    if (isPaletteCategory(parent, config)) ancestors.push(parent.id);
    visited.add(parent.id);
    current = parent;
  }
  return ancestors.reverse();
}
