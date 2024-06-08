import type { GraphInterface, Vertex } from "~/lib/graph/graph";
import type { SetStoreFunction } from "solid-js/store";
import { mergeVertexProperties } from "~/lib/graph/mutate/vertex";
import { sortChildren } from "~/lib/drag-drop/sortChildren";
import { setParentValue } from "~/lib/graph/mutate/setParentValue";

export async function handleParentChange(
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  txnId: number,
  fromVertex: Vertex,
  fromParentVertex: Vertex | undefined,
  toParentVertex: Vertex,
  position: string,
  toVertex: Vertex,
) {
  // remove previous incoming edge if present.
  const attrMetaVertex = {
    P: { props: { type: "Attr" } },
  } as unknown as Vertex;
  if (fromParentVertex) {
    setParentValue(graph, setGraph, txnId, fromVertex, attrMetaVertex);
  }
  // add new edge.
  if (position === "center") {
    setParentValue(
      graph,
      setGraph,
      txnId,
      fromVertex,
      attrMetaVertex,
      toVertex.id,
    );
    mergeVertexProperties(txnId, fromVertex?.id, graph, setGraph, {
      pos: 9999999,
    }); // move to end
  } else {
    setParentValue(
      graph,
      setGraph,
      txnId,
      fromVertex,
      attrMetaVertex,
      toParentVertex?.id,
    );
  }

  // sort from parent's children
  // sort if required.
  // sort to parent's children
  sortChildren(
    graph,
    setGraph,
    txnId,
    fromVertex,
    toParentVertex!,
    toVertex,
    position,
  );
}
