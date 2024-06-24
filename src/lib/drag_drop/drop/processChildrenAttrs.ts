import type {GraphInterface, Vertex} from "~/lib/graph/graph";
import type {SetStoreFunction, Store} from "solid-js/store";
import {getChildrenAttrs} from "~/lib/drag_drop/getChildrenAttrs";
import {addNewRow, cloneRowProps} from "~/lib/graph/mutate/form/rowFunction";
import {getComponentFromLayoutRow} from "~/lib/drag_drop/drop/getComponentFromLayoutRow";
import {setSelectionValue} from "~/lib/graph/mutate/setSelectionValue";

export function processChildrenAttrs(
  formVertex: Vertex,
  fromVertex: Vertex,
  toVertex: Vertex,
  txnId: number,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  attrMetaVertex: Vertex,
  attrCompMetaVertex: Vertex,
) {
  const childrenVertexes = getChildrenAttrs(graph, setGraph, fromVertex);
  const results = [];
  for (const child of childrenVertexes) {
    const rowResult = addNewRow(
      txnId,
      attrMetaVertex,
      graph,
      setGraph,
      toVertex,
      {}, //{pos: child.P.pos}, // ont set position property
      false,
      {} as any,
    );
    const rowVertex = graph.vertexes[rowResult.vertexId!];
    const compVertex = getComponentFromLayoutRow(child.id, graph, setGraph);
    setSelectionValue(
      txnId,
      rowVertex,
      graph,
      setGraph,
      attrCompMetaVertex,
      compVertex.id,
    );
    cloneRowProps(graph, setGraph, formVertex, txnId, child, rowVertex);
    processChildrenAttrs(
      formVertex,
      child,
      rowVertex,
      txnId,
      graph,
      setGraph,
      attrMetaVertex,
      attrCompMetaVertex,
    );
    results.push(rowResult.vertexId!);
  }
  return results;
}