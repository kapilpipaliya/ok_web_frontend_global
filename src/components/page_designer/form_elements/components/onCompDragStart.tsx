import type { GraphInterface, useGraph, Vertex } from "~/lib/graph/graph";
import { mergeVertexProperties } from "~/lib/graph/mutate/vertex";
import type { PageLayoutObject } from "../../context/LayoutContext";
import { SetStoreFunction } from "solid-js/store";
import { FormStoreObject } from "~/components/form/context/FormContext";

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
  const formStoreVertex = () => graph.vertexes[layoutStore().formId!] as Vertex<FormStoreObject>;

  mergeVertexProperties<FormStoreObject>(0, layoutStore().formId!, graph, setGraph, {
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

  mergeVertexProperties<FormStoreObject>(0, layoutStore().formId!, graph, setGraph, {
    draggedVertexIds: [...formStoreVertex()?.P.draggedVertexIds, ...draggedItems.map(v => v.id)],
  });

  if (setSelectedComponents) {
    setSelectedComponents(() => new Set<Vertex>());
  }
}
