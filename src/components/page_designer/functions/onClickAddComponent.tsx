import type { SetStoreFunction, Store } from "solid-js/store";

import type { GraphInterface, Id, Vertex } from "~/lib/graph/graph";

import { handleComponentDrag } from "~/components/page_designer/functions/handleComponentDrag";
import { getChildVertex } from "~/lib/graph/get/sync/getChildVertex";
import { getParentVertex } from "~/lib/graph/get/sync/getParentVertex";

export function onClickAddComponent(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  txnId: number,
  fromVertex: Vertex,
  formData: any,
  toVertexId: Id | number,
) {
  let toVertex = graph.vertexes[toVertexId];
  const componentName = getChildVertex(graph, ["$0Comp"], toVertex).vertex
  if (!componentName?.P.child) {
    toVertex = getParentVertex(["Attr"], toVertex, graph).vertex!;
  }
  const toParentVertex =  getParentVertex(["Attr"], toVertex, graph).vertex;

  handleComponentDrag(
    graph,
    setGraph,
    txnId,
    fromVertex,
    toVertex,
    toParentVertex!,
    formData,
    "999999",
  );
}
