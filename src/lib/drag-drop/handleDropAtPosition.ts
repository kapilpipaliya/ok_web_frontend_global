import type {SetStoreFunction, Store} from "solid-js/store";
import type {GraphInterface, Vertex} from "~/lib/graph/graph";
import {validateDragOver} from "~/lib/drag-drop/validateDragOver";
import {getParentVertex} from "~/lib/graph/get/sync/traverse";
import {handleComponentDrag} from "~/lib/drag-drop/handleComponentDrag";
import {handlePageDrag} from "~/lib/drag-drop/handlePageDrag";
import {sortChildren} from "~/lib/drag-drop/sortChildren";
import {handleParentChange} from "~/lib/drag-drop/handleParentChange";

export async function handleDropAtPosition(graph: Store<GraphInterface>, setGraph: SetStoreFunction<GraphInterface>, txnId: number, formData: any, fromVertex: Vertex, toVertex: Vertex, position: string) {
  if (!validateDragOver(graph, setGraph, fromVertex, toVertex.id, formData, position)) {
    return;
  }
  const fromParentVertex = getParentVertex(["Attr"], fromVertex, graph);
  const toParentVertex =
    position === "center"
      ? toVertex
      : getParentVertex(["Attr"], toVertex, graph).vertex;

  if (fromVertex.L[0] === "Comp") {
    await handleComponentDrag(graph, setGraph, txnId, fromVertex, toVertex, toParentVertex!, formData, position);
  } else if (fromVertex.L[0] === "Page") {
    await handlePageDrag(graph, setGraph, txnId, fromVertex, toVertex, toParentVertex, formData, position);
  } else if (
    position !== "center" &&
    fromParentVertex.vertex?.id === toParentVertex?.id
  ) {
    sortChildren(graph, setGraph, txnId, fromVertex, toParentVertex!, toVertex, position);
  } else {
    await handleParentChange(graph, setGraph, txnId, fromVertex, fromParentVertex.vertex, toParentVertex!, position, toVertex);
  }
}