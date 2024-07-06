import type { SetStoreFunction, Store } from "solid-js/store";

import type { GraphInterface, Id, Vertex } from "~/lib/graph/graph";

import { handleComponentDrag } from "~/components/page_designer/functions/handleComponentDrag";
import { getParentVertex } from "~/lib/graph/get/sync/traverse";

export function onClickAddComponent(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  txnId: number,
  fromVertex: Vertex,
  formData: any,
  toVertexId: Id | number
) {
  const toVertex = graph.vertexes[toVertexId];
  const toParentVertex = getParentVertex(["Attr"], toVertex, graph).vertex;

  handleComponentDrag(
    graph,
    setGraph,
    txnId,
    fromVertex,
    toVertex,
    toParentVertex!,
    formData,
    "999999"
  );
}
