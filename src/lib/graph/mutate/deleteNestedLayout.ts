import type { SetStoreFunction, Store } from "solid-js/store";

import type { GraphInterface, Vertex } from "~/lib/graph/graph";

import { getSelectionOptions } from "../get/sync/traverse";
import { deleteRow } from "./deleteRow";

export function deleteNestedLayout(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  txnId: number,
  vertexes: Vertex[] = [],
  options?: {
    addChild?: (child: Vertex) => boolean;
    nameExpr?: (child: Vertex) => string;
  },
) {
  const deleteChildren = (vertexes: Vertex[]) => {
    const children = getSelectionOptions(graph, () => 0, "->Attr", vertexes);
    for (const child of children.vertexes || []) {
      // delete children
      deleteChildren([child]);

      // delete properties:
      const AttrProps = getSelectionOptions(graph, () => 0, "->$0Prop", vertexes);
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
