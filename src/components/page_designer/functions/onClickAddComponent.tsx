import type { SetStoreFunction, Store } from "solid-js/store";

import type { GraphInterface, Id, Vertex } from "~/lib/graph/graph";

import { getChildVertex } from "~/lib/graph/get/sync/getChildVertex";
import { getParentVertex } from "~/lib/graph/get/sync/getParentVertex";
import { sortChildren } from "./sortChildren";
import { componentDrop } from "./drop/componentDrop";
import { saveUndoPoint } from "~/lib/graph/transaction/saveUndoPoint";

export function onClickAddComponent(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  txnId: number,
  fromVertex: Vertex,
  formData: any,
  toVertexId: Id | number,
) {
  let toVertex = graph.vertexes[toVertexId];
  const componentName = getChildVertex(graph, ["$0Comp"], toVertex).vertex;
  if (!componentName?.P.child) {
    toVertex = getParentVertex(["Attr"], toVertex, graph).vertex!;
  }
  const toParentVertex = getParentVertex(["Attr"], toVertex, graph).vertex;

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
