import type { SetStoreFunction, Store } from "solid-js/store";

import type { GraphInterface, Id, Vertex } from "~/lib/graph/graph";

import { evalExpression } from "~/lib/expression_eval";

export function validateDragOver(
  graph: Store<GraphInterface>,
  _setGraph: SetStoreFunction<GraphInterface>,
  fromVertex: Vertex,
  toVertexId: Id | number,
  formData: Vertex,
  position: string,
) {
  // If fromVertex is not valid, don't allow drop
  if (!fromVertex) {
    return false;
  }
  // If fromVertex and toVertex are the same, don't allow drop
  if (fromVertex.id === toVertexId) {
    return false;
  }

  // Don't allow parent to move inside children.
  let parentVertex = graph.vertexes[toVertexId];
  while (true) {
    const parentResult = evalExpression("<-Attr", {
      graph,
      vertexes: [parentVertex],
    })?.[0];
    if (!parentResult) {
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
      // each component can accept children
      // const compVertex = getComponentFromLayoutRow(toVertexId, graph, setGraph);
      // if (!compVertex?.P.child) {
      //   // Don't allow drag and drop
      //   return false;
      // }
    }
  } else {
    const toParentVertex = evalExpression("<-Attr", {
      graph,
      vertexes: [graph.vertexes[toVertexId]],
    })?.[0];

    if (!toParentVertex) {
      // Dont allow drag before and after first element
      return;
    }

    // const rootChildren = () => evalExpression("->Attr", { graph, setGraph, vertexes: [formData] }) || [];
    // const isFormRootVertetx = () => formData?.L?.[0] === "Form";
    const rootVertexes = () => {
      // if (isFormRootVertetx()) {
      //   return rootChildren();
      // }
      return [formData];
    };
    if (rootVertexes().includes(graph.vertexes[toVertexId])) {
      // Dont allow drag before and after first element
      return;
    }
  }
  return true;
}
