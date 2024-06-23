import {type GraphInterface, IdAttr, type Vertex} from "~/lib/graph/graph";
import type {SetStoreFunction, Store} from "solid-js/store";
import {setSelectionValue} from "~/lib/graph/mutate/setSelectionValue";
import {addPropsToLayoutRow} from "~/lib/drag_drop/component_drop/addPropsToLayoutRow";
import {createAttrCollMetaVertex} from "~/lib/drag_drop/component_drop/createAttrCollMetaVertex";
import {findVertexByLabelAndUniqueId} from "~/lib/graph/get/sync/findVertex";

export function handleCompOrCollVertex(
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
  }
}