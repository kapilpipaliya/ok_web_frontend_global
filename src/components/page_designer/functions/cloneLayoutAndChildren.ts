import type { SetStoreFunction } from "solid-js/store";

import type { GraphInterface, Vertex } from "~/lib/graph/graph";

import { componentDrop } from "~/components/page_designer/functions/drop/componentDrop";
import { getParentVertex } from "~/lib/graph/get/sync/getParentVertex";

import { saveUndoPoint } from "../../../lib/graph/transaction/saveUndoPoint";
import { sortChildren } from "./sortChildren";

export function cloneLayoutAndChildren(
  layoutVertex: Vertex,
  toExternalVertex: undefined | Vertex,
  externalTxnId: number | undefined,
  txnId: number,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  formData: Vertex,
) {
  let fromVertex = layoutVertex;
  const toVertex = toExternalVertex ?? layoutVertex;
  const txnId2 = externalTxnId ?? txnId;

  const position = toExternalVertex ? "center" : "after";

  const toParentVertex =
    toExternalVertex ?? getParentVertex(["Attr"], toVertex, graph).vertex;

  const layoutRowId = componentDrop(
    formData,
    txnId2,
    fromVertex,
    toParentVertex || formData,
    graph,
    setGraph,
  );
  if (layoutRowId === -1) { return; }

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
