import type { SetStoreFunction } from "solid-js/store";

import type { GraphInterface, Vertex } from "~/lib/graph/graph";

import { componentDrop } from "~/components/page_designer/functions/drop/componentDrop";
import { sortChildren } from "~/components/page_designer/functions/sortChildren";

import { saveUndoPoint } from "../../../lib/graph/transaction/saveUndoPoint";

export function handleComponentDrag(
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  txnId: number,
  fromVertex: Vertex,
  toVertex: Vertex,
  toParentVertex: Vertex,
  formData: Vertex,
  position: string,
) {
  const layoutId = handleComponentDropAndSort(
    graph,
    setGraph,
    txnId,
    fromVertex,
    toVertex,
    toParentVertex,
    formData,
    position,
  );

  saveUndoPoint(txnId, graph);

  return layoutId;
}

function handleComponentDropAndSort(
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  txnId: number,
  fromVertex: Vertex,
  toVertex: Vertex,
  toParentVertex: Vertex,
  formData: Vertex,
  position: string,
  properties?: { [key: string]: string },
) {
  const layoutRowId = componentDrop(
    formData,
    txnId,
    fromVertex,
    toParentVertex || formData,
    graph,
    setGraph,
    undefined,
    properties,
  );
  if (layoutRowId === -1) {
    return layoutRowId;
  }

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
  return layoutRowId;
}
