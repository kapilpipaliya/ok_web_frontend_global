import {
  batch
} from "solid-js";
import type { SetStoreFunction, Store } from "solid-js/store";
import { deleteNestedLayout } from "../../graph/mutate/deleteNestedLayout";
import type { GraphInterface, Vertex } from "~/lib/graph/graph";

import type { PageLayoutObject } from "~/components/page_designer/LayoutContext";

export function deleteLayoutGlobal(layoutStore: Store<PageLayoutObject>, setLayoutStore: SetStoreFunction<PageLayoutObject>, layoutVertex: Vertex, graph: GraphInterface, setGraph: SetStoreFunction<GraphInterface>, txnId: number, name: string, showSuccessToast: (message: string) => void) {
  batch(() => {
    if (layoutStore.selectedId === layoutVertex.id) {

      setLayoutStore('selectedId', -1);
      setLayoutStore('selectedComponent', -1);
      setLayoutStore('selectedColl', -1);
    }
    if (layoutStore.hoverId === layoutVertex.id) {
      setLayoutStore('hoverId', -1);
    }
  });

  deleteNestedLayout(graph, setGraph, txnId, [layoutVertex]);
  if (name) {
    showSuccessToast(`${name} deleted successfully`);
  }
}
