
import type { SetStoreFunction, Store } from "solid-js/store";
import type { GraphInterface, Vertex } from "~/lib/graph/graph";
import { loadPageData } from "~/lib/drag_drop/loadPageData";
import { handleDropAtPosition } from "~/lib/drag_drop/handleDropAtPosition";
import { PageDesignerLabels } from "../../../lib/drag_drop/constant";
import type { PageLayoutObject } from "~/components/page_designer/LayoutContext";

export async function handleDrop(e: DragEvent,layoutStore: Store<PageLayoutObject>, graph: GraphInterface, showErrorToast: (message: string) => void, setGraph: SetStoreFunction<GraphInterface>, txnId: number, formData: Vertex) {
  e.stopPropagation();
  for (const vertex of layoutStore.draggedVertices) {
    const fromVertex = vertex;

    const toVertex = graph.vertexes[layoutStore.activeItem!]; // layoutVertex;
    if (!fromVertex) {
      showErrorToast("from Vertex not found when dropping ");
      return;
    }

    if (PageDesignerLabels.includes(fromVertex.L[0])) {
      await loadPageData(graph, setGraph, fromVertex, showErrorToast);
    }

    if (!layoutStore.position) {
      showErrorToast("Position not found when dropping");
      return;
    }
    // NOTE: Multiple selected dragged vertexes may not drop before or after as expected. test it.
    await handleDropAtPosition(
      graph,
      setGraph,
      txnId,
      formData,
      fromVertex,
      toVertex,
      layoutStore.position
    );
  }
}
