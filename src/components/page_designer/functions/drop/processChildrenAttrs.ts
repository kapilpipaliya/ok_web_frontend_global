import type { SetStoreFunction, Store } from "solid-js/store";

import { klona } from "klona";

import type { GraphInterface, Vertex } from "~/lib/graph/graph";

import { getComponentFromLayoutRow } from "~/components/page_designer/functions/drop/getComponentFromLayoutRow";
import {
  getChildrenAttrs,
  getUniqueName,
} from "~/components/page_designer/functions/getChildrenAttrs";
import { addNewRow } from "~/lib/graph/mutate/form/rowFunction";
import { setSelectionValue } from "~/lib/graph/mutate/setSelectionValue";

export function getRowProps(
  fromVertex: Vertex,
  txnId: number,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  formVertex: Vertex,
) {
  const props = klona(fromVertex.P);
  delete props.pos;
  const uniqueName = getUniqueName(txnId, graph, setGraph, formVertex, {
    id: 0,
  } as unknown as Vertex);
  return { ...props, name: uniqueName };
}

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
    const props = getRowProps(child, txnId, graph, setGraph, formVertex);
    const rowResult = addNewRow(
      txnId,
      attrMetaVertex,
      graph,
      setGraph,
      toVertex,
      props,
      false,
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
