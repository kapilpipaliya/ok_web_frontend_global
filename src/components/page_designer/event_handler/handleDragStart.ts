import type { SetStoreFunction, Store } from "solid-js/store";
import { FormStoreObject } from "~/components/form/context/FormContext";

import type { PageLayoutObject } from "~/components/page_designer/context/LayoutContext";
import type { GraphInterface, Id, Vertex } from "~/lib/graph/graph";
import { mergeVertexProperties } from "~/lib/graph/mutate/vertex";

export function handleDragStart(
  e: DragEvent,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  layoutStoreId: Id,
  layoutVertex: Vertex,
) {
  e.stopPropagation();

  const layoutStore = () => graph.vertexes[layoutStoreId].P as PageLayoutObject;
  const formStoreVertex = () => graph.vertexes[layoutStore().formId!] as Vertex<FormStoreObject>;

  mergeVertexProperties<FormStoreObject>(0, layoutStore().formId!, graph, setGraph, {
    draggedVertexIds: [...(formStoreVertex()?.P.draggedVertexIds || []), layoutVertex.id],
  });
}
