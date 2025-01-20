import type { GraphInterface, useGraph, Vertex } from "~/lib/graph/graph";
import { mergeVertexProperties } from "~/lib/graph/mutate/vertex";
import { useDesignerFormIdContext, type PageLayoutObject } from "../../context/LayoutContext";
import { SetStoreFunction } from "solid-js/store";
import { FormStoreObject } from "~/components/form/context/FormContext";

export function onCompDragStart(
  e: DragEvent,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  childId: string,
  layoutStoreVertex: Vertex<PageLayoutObject>,
  selectedComponents?: () => Set<Vertex>,
  setSelectedComponents?: (updater: (prev: Set<Vertex>) => Set<Vertex>) => void,
) {
  e.stopPropagation();

  mergeVertexProperties<PageLayoutObject>(0, layoutStoreVertex.id, graph, setGraph, {
    draggedVertexIds: [],
  });
  if (!graph.vertexes[childId]) {
    console.error('Dragged vertex not found, this should not happen');
    return;
  }

  const draggedItems =
    selectedComponents && selectedComponents().size > 0
      ? Array.from(selectedComponents())
      : [graph.vertexes[childId]];

  mergeVertexProperties<PageLayoutObject>(0, layoutStoreVertex.id, graph, setGraph, {
    draggedVertexIds: [...layoutStoreVertex.P.draggedVertexIds, ...draggedItems.map(v => v.id)],
  });

  if (setSelectedComponents) {
    setSelectedComponents(() => new Set<Vertex>());
  }
}
