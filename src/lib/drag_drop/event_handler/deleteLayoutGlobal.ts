import {
  type Accessor,
  batch
} from "solid-js";
import type { SetStoreFunction } from "solid-js/store";
import { deleteNestedLayout } from "../../graph/mutate/deleteNestedLayout";
import type { GraphInterface, Id, Vertex } from "~/lib/graph/graph";
import type { Setter } from "solid-js";

export function deleteLayoutGlobal(selectedId: Accessor<string | number>, layoutVertex: Vertex, setSelectedId: Setter<Id | number>, setSelectedComponent: Setter<{ vertexId: Id | number; }>, setSelectedColl: Setter<{ vertexId: Id | number; }>, hoverId: Accessor<string | number>, setHoverId: Setter<Id | number>, graph: GraphInterface, setGraph: SetStoreFunction<GraphInterface>, txnId: number, name: string, showSuccessToast: (message: string) => void) {
  batch(() => {
    if (selectedId() === layoutVertex.id) {
      setSelectedId(-1);
      setSelectedComponent({ vertexId: -1 });
      setSelectedColl({ vertexId: -1 });
    }
    if (hoverId() === layoutVertex.id) {
      setHoverId(-1);
    }
  });

  deleteNestedLayout(graph, setGraph, txnId, [layoutVertex]);
  if (name) {
    showSuccessToast(`${name} deleted successfully`);
  }
}
