import { type GraphInterface, IdAttr, type Vertex } from "~/lib/graph/graph";
import { findVertexByLabelAndUniqueId } from "~/lib/graph/get/sync/findVertex";
import { componentDrop } from "~/lib/drag_drop/drop/componentDrop";
import { sortChildren } from "~/lib/drag_drop/sortChildren";
import type { PageLayoutObject } from "../../LayoutContext";
import type { SetStoreFunction, Store } from "solid-js/store";

export function addStepBefore(graph: Store<GraphInterface>, setGraph: SetStoreFunction<GraphInterface>, layoutStore: Store<PageLayoutObject>, setLayoutStore: SetStoreFunction<PageLayoutObject>, toVertex: Vertex) {
  // add form component
  const formVertex = findVertexByLabelAndUniqueId(
    graph,
    "Comp",
    IdAttr,
    "Form"
  );
  const layoutRowId = componentDrop(
    layoutStore.formData.formData,
    layoutStore.formData.txnId,
    formVertex!,
    layoutStore.formData.formData,
    graph,
    setGraph
  );


  if (layoutRowId === -1) return;

  const fromVertex = graph.vertexes[layoutRowId];

  sortChildren(
    graph,
    setGraph,
    layoutStore.formData.txnId,
    fromVertex,
    layoutStore.formData.formData,
    toVertex,
    "before"
  );

  setLayoutStore('activeStepId', layoutRowId);
}
