import type { Accessor } from "solid-js";
import type { SetStoreFunction } from "solid-js/store";
import type { GraphInterface, Vertex } from "~/lib/graph/graph";
import { loadPageData } from "~/lib/drag_drop/loadPageData";
import { handleDropAtPosition } from "~/lib/drag_drop/handleDropAtPosition";
import { PageDesignerLabels } from "../constant";
import type { IIndicatorPosition } from "../../contexts";


export async function handleDrop(e: DragEvent, draggedVertex: () => (Vertex[] | []), indicatorPosition: Accessor<IIndicatorPosition>, graph: GraphInterface, showErrorToast: (message: string) => void, setGraph: SetStoreFunction<GraphInterface>, txnId: number, formData: Vertex) {
  e.stopPropagation();
  for (const vertex of draggedVertex()) {
    const fromVertex = vertex;

    const toVertexId = indicatorPosition().activeItem!;
    const toVertex = graph.vertexes[toVertexId]; // layoutVertex;
    if (!fromVertex) {
      showErrorToast("from Vertex not found when dropping ");
      return;
    }

    if (PageDesignerLabels.includes(fromVertex.L[0])) {
      await loadPageData(graph, setGraph, fromVertex, showErrorToast);
    }

    const position = indicatorPosition().position;
    if (!position) {
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
      position
    );
  }
}
