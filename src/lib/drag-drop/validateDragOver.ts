import type {SetStoreFunction, Store} from "solid-js/store";
import type {GraphInterface, Id, Vertex} from "~/lib/graph/graph";
import {getParentVertex} from "~/lib/graph/get/sync/traverse";
import {getComponentFromLayoutRow} from "~/lib/drag-drop/componentDrag";

export function validateDragOver(graph: Store<GraphInterface>, setGraph: SetStoreFunction<GraphInterface>, fromVertex: Vertex, toVertexId: Id, formData: Vertex, position: string) {
  // Don't allow parent to move inside children.
  let parentVertex = graph.vertexes[toVertexId];
  while (true) {
    const parentResult = getParentVertex(["Attr"], parentVertex, graph);
    if (parentResult.error) {
      break;
    }
    if (parentResult.vertex?.id === fromVertex.id) {
      // Don't allow drag and drop
      return false;
    }
    parentVertex = parentResult.vertex!;
  }

  if (position === "center") {
    // is Top Layer:
    if (toVertexId === formData.id) {
      // Allow drag over it
    } else {
      const compVertex = getComponentFromLayoutRow(
        toVertexId,
        graph,
        setGraph,
      );
      if (!compVertex?.P.child) {
        // Don't allow drag and drop
        return false;
      }
    }
  } else {
    const toParentVertex =
      position === "center"
        ? graph.vertexes[toVertexId]
        : getParentVertex(["Attr"], graph.vertexes[toVertexId], graph).vertex;

    if (!toParentVertex) {
      // Dont allow drag before and after first element
      return;
    }
  }
  return true;
}