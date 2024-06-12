import {GraphInterface, IdAttr, Vertex} from "~/lib/graph/graph";
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
  } else if (fromVertex.L[0] === "Coll") {
    // set Collection to the row
    const attrCollMetaVertex = createAttrCollMetaVertex();
    setSelectionValue(
      txnId,
      rowVertex,
      graph,
      setGraph,
      attrCollMetaVertex,
      fromVertex.id,
    );
    const formVertex = findVertexByLabelAndUniqueId(
      graph,
      "Comp",
      IdAttr,
      "Form",
    );
    if (!formVertex) {
      showErrorToast("Can't find form");
    } else {
      setSelectionValue(
        txnId,
        rowVertex,
        graph,
        setGraph,
        attrCompMetaVertex,
        formVertex.id,
      );
      addPropsToLayoutRow(graph, txnId, rowVertex.id, formVertex);
    }
  }
}