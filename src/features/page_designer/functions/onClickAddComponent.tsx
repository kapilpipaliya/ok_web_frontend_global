import type { SetStoreFunction, Store } from "solid-js/store";

import type { GraphInterface, Id, Vertex } from "~/lib/graph/graph";

import { evalExpression } from "~/lib/expression_eval";
import { saveUndoPoint } from "~/lib/graph/transaction/steps/saveUndoPoint";

import { componentDrop } from "./drop/componentDrop";
import { sortChildren } from "./sortChildren";

export function onClickAddComponent(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  txnId: number,
  fromVertex: Vertex,
  formData: any,
  toVertexId: Id | number,
) {
  const toVertex = graph.vertexes[toVertexId];
  const _component = evalExpression("->$0Comp", {
    graph,
    vertexes: [toVertex],
  });
  // if (!component?.[0]?.P.child) {
  //   toVertex = evalExpression("<-Attr", {
  //     graph,
  //     vertexes: [toVertex],
  //   })?.[0];
  // }
  const toParentVertex = evalExpression("<-Attr", {
    graph,
    vertexes: [toVertex],
  })?.[0];

  const layoutRowId = componentDrop(
    formData,
    txnId,
    fromVertex,
    toParentVertex || formData,
    graph,
    setGraph,
    undefined,
    undefined,
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
    "999999",
  );

  saveUndoPoint(txnId, graph, setGraph);

  return layoutRowId;
}
