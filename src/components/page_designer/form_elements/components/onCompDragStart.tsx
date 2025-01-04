import type { GraphInterface, useGraph, Vertex } from "~/lib/graph/graph";
import { mergeVertexProperties } from "~/lib/graph/mutate/vertex";
import type { PageLayoutObject } from "../../context/LayoutContext";
import { SetStoreFunction } from "solid-js/store";

export function onCompDragStart(
  e: DragEvent,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  childId: string,
  layoutStoreId: string,
  selectedComponents?: () => Set<Vertex>,
  setSelectedComponents?: (updater: (prev: Set<Vertex>) => Set<Vertex>) => void,
) {
  e.stopPropagation();

  const layoutStore = () => graph.vertexes[layoutStoreId].P as PageLayoutObject;

  mergeVertexProperties<PageLayoutObject>(0, layoutStoreId, graph, setGraph, {
    draggedVertices: [],
  });

  const draggedItems =
    selectedComponents && selectedComponents().size > 0
      ? Array.from(selectedComponents())
      : [graph.vertexes[childId]];

  mergeVertexProperties<PageLayoutObject>(0, layoutStoreId, graph, setGraph, {
    draggedVertices: [...layoutStore().draggedVertices, ...draggedItems],
  });

  if (setSelectedComponents) {
    setSelectedComponents(() => new Set<Vertex>());
  }
}
