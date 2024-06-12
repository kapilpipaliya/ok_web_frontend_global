import type {GraphInterface, Vertex} from "~/lib/graph/graph";
import type {SetStoreFunction, Store} from "solid-js/store";
import {getComponentFromLayoutRow} from "~/lib/drag_drop/component_drop/getComponentFromLayoutRow";
import {setSelectionValue} from "~/lib/graph/mutate/setSelectionValue";
import {cloneRowProps} from "~/lib/graph/mutate/form/rowFunction";
import {processChildren} from "~/lib/drag_drop/component_drop/processChildren";

export function handleAttrVertex(
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
  cloneRowProps(graph, setGraph, txnId, fromVertex, rowVertex);
  processChildren(
    fromVertex,
    rowVertex,
    txnId,
    graph,
    setGraph,
    attrMetaVertex,
    attrCompMetaVertex,
  );
}