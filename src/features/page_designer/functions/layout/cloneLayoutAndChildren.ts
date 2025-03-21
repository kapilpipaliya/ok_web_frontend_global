import type { SetStoreFunction } from "solid-js/store";

import type { Vertex } from "~/lib/graph/graph";
import type { GraphInterface } from "~/lib/graph/GraphContext";

import { componentDrop } from "~/features/page_designer/functions/drag_drop/componentDrop";
import { evalExpression } from "~/lib/expression_eval";
import { saveUndoPoint } from "~/lib/graph/transaction/steps/saveUndoPoint";

import { sortChildren } from "../drag_drop/sortChildren";

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
    toExternalVertex ??
    evalExpression("<-Attr", {
      graph,
      vertexes: [toVertex],
    })?.[0];

  const layoutRowId = componentDrop(
    formData,
    txnId2,
    fromVertex,
    toParentVertex || formData,
    graph,
    setGraph,
  );
  if (layoutRowId === -1) {
    return;
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

  saveUndoPoint(txnId2, graph, setGraph);
}
