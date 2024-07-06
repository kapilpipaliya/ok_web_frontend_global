import type { SetStoreFunction } from "solid-js/store";

import type { GraphInterface, Vertex } from "~/lib/graph/graph";

import { componentDrop } from "~/lib/drag_drop/drop/componentDrop";
import { getChildrenAttrs } from "~/lib/drag_drop/getChildrenAttrs";
import { mergeVertexProperties } from "~/lib/graph/mutate/vertex";

import { getParentVertex } from "../graph/get/sync/traverse";
import { saveUndoPoint } from "./saveUndoPoint";
import { sortChildren } from "./sortChildren";


export function cloneLayoutAndChildren(layoutVertex: Vertex, toExternalVertex: Vertex | undefined, externalTxnId: number | undefined, txnId: number, graph: GraphInterface, setGraph: SetStoreFunction<GraphInterface>, formData: Vertex) {
  let fromVertex = layoutVertex;
  const toVertex = toExternalVertex ?? layoutVertex;
  const txnId2 = externalTxnId ?? txnId;

  const position = toExternalVertex ? "center" : "after";

  const toParentVertex = toExternalVertex ?? getParentVertex(["Attr"], toVertex, graph).vertex;

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

  sortChildren(
    graph,
    setGraph,
    txnId,
    fromVertex,
    toParentVertex!,
    toVertex,
    position,
  );

  saveUndoPoint(txnId2, graph);
}

