import { GraphInterface, Vertex } from "~/lib/graph/graph";
import { getChildVertexes } from "../get/sync/traverse";
import { deleteRow } from "./deleteRow";
import { SetStoreFunction, Store } from "solid-js/store";


export function deleteNestedLayout(graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  txnId: number,
  vertexes: Vertex[] = [],
  options?: {
    nameExpr?: (child: Vertex) => string;
    addChild?: (child: Vertex) => boolean;
  }) {
  const deleteChildren = (vertexes: Vertex[]) => {
    const children = getChildVertexes(graph, ["Attr"], vertexes);
    for (const child of children.vertexes || []) {
      // delete children
      deleteChildren([child]);

      // delete properties:
      const AttrProps = getChildVertexes(graph, ["AttrProp"], vertexes);
      if (!AttrProps.error) {
        for (const vertex of AttrProps.vertexes!) {
          // delete in edges and out edges of properties
          deleteRow(vertex, false, graph, setGraph, txnId, {} as any);
          // no commitTxn because, it's not realtime
        }
      }

      // delete in edges and out edges and attr
      deleteRow(child, false, graph, setGraph, txnId, {} as any);
    }
  };

  deleteChildren(vertexes);
  for (const child of vertexes) {
    deleteRow(child, false, graph, setGraph, txnId, {} as any);
  }
}



