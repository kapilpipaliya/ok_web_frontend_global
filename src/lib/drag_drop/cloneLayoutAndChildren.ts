import type { SetStoreFunction } from "solid-js/store";

import type { GraphInterface, Vertex } from "~/lib/graph/graph";

import { componentDrop } from "~/lib/drag_drop/drop/componentDrop";
import { getChildrenAttrs } from "~/lib/drag_drop/getChildrenAttrs";
import { mergeVertexProperties } from "~/lib/graph/mutate/vertex";

import { getParentVertex } from "../graph/get/sync/traverse";


export function cloneLayoutAndChildren(layoutVertex: Vertex, toExternalVertex: Vertex | undefined, externalTxnId: number | undefined, txnId: number, graph: GraphInterface, setGraph: SetStoreFunction<GraphInterface>, formData: Vertex) {
  let fromVertex = layoutVertex;
  const toVertex = toExternalVertex ?? layoutVertex;
  const txnId2 = externalTxnId ?? txnId;

  const position = toExternalVertex ? "center" : "after";

  const toParentVertex = toExternalVertex ?? getParentVertex(["Attr"], toVertex, graph).vertex;

  function sortChildren() {
    let pos = 1;
    const childrenAttrs = getChildrenAttrs(graph, setGraph, toParentVertex!);
    for (const child of childrenAttrs) {
      if (child.id === fromVertex?.id) {
        continue;
      }

      if (child.id === toVertex.id) {
        if (position === "after") {
          mergeVertexProperties(txnId2, child.id, graph, setGraph, { pos });
          pos++;
          mergeVertexProperties(txnId2, fromVertex?.id, graph, setGraph, {
            pos,
          });
          pos++;
        }
      } else {
        mergeVertexProperties(txnId2, child.id, graph, setGraph, { pos });
        pos++;
      }
    }
  }

  const layoutRowId = componentDrop(
    formData,
    txnId2,
    fromVertex,
    toParentVertex || formData,
    graph,
    setGraph
  );
  if (layoutRowId === -1) return;

  fromVertex = graph.vertexes[layoutRowId];

  sortChildren();
}
