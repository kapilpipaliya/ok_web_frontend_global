import type { GraphInterface, Vertex } from "~/lib/graph/graph";
import type { SetStoreFunction, Store } from "solid-js/store";
import { setSelectionValue } from "~/lib/graph/mutate/setSelectionValue";
import { addPropsToLayoutRow } from "~/lib/drag_drop/drop/addPropsToLayoutRow";
import { mergeVertexProperties } from "~/lib/graph/mutate/vertex";

export function handleCompVertex(
  fromVertex: Vertex,
  txnId: number,
  rowVertex: Vertex,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  attrCompMetaVertex: Vertex,
  showErrorToast: (message: string) => void,
) {
  if (fromVertex.L[0] === "Comp") {
    // set Component to the row
    setSelectionValue(
      txnId,
      rowVertex,
      graph,
      setGraph,
      attrCompMetaVertex,
      fromVertex.id,
    );
    addPropsToLayoutRow(graph, txnId, rowVertex.id, fromVertex);


    if (fromVertex.P.name === "Text") {
      mergeVertexProperties(txnId, rowVertex.id, graph, setGraph, { text: "Sample Text" });
    }
  }
}