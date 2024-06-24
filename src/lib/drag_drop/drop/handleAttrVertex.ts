import type {GraphInterface, Vertex} from "~/lib/graph/graph";
import type {SetStoreFunction, Store} from "solid-js/store";
import {getComponentFromLayoutRow} from "~/lib/drag_drop/drop/getComponentFromLayoutRow";
import {setSelectionValue} from "~/lib/graph/mutate/setSelectionValue";
import {cloneRowProps} from "~/lib/graph/mutate/form/rowFunction";
import {processChildrenAttrs} from "~/lib/drag_drop/drop/processChildrenAttrs";

export function handleAttrVertex(
  formVertex: Vertex,
  fromVertex: Vertex,
  rowVertex: Vertex,
  txnId: number,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  attrMetaVertex: Vertex,
  attrCompMetaVertex: Vertex,
) {
  const compVertex = getComponentFromLayoutRow(fromVertex.id, graph, setGraph);
  setSelectionValue(
    txnId,
    rowVertex,
    graph,
    setGraph,
    attrCompMetaVertex,
    compVertex.id,
  );
  cloneRowProps(graph, setGraph,formVertex, txnId, fromVertex, rowVertex);
  processChildrenAttrs(
    formVertex,
    fromVertex,
    rowVertex,
    txnId,
    graph,
    setGraph,
    attrMetaVertex,
    attrCompMetaVertex,
  );
}