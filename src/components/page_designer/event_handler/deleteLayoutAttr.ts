import type { SetStoreFunction, Store } from "solid-js/store";

import { batch } from "solid-js";

import type { PageLayoutObject } from "~/components/page_designer/LayoutContext";
import type { GraphInterface, Vertex } from "~/lib/graph/graph";

import { deleteNestedLayout } from "../../../lib/graph/mutate/deleteNestedLayout";
import { getAllFieldsUsedInRules, isAttrUsedInRules } from "../functions/getChildrenAttrs";

export function deleteLayoutAttr(
  layoutStore: Store<PageLayoutObject>,
  setLayoutStore: SetStoreFunction<PageLayoutObject>,
  layoutVertex: Vertex,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  txnId: number,
  name: string,
  showSuccessToast: (message: string) => void,
) {
  const usedAttrs = getAllFieldsUsedInRules(graph, setGraph, layoutStore.formData.formData);
  const usedAttrsInRules = isAttrUsedInRules(layoutVertex, usedAttrs, graph);

  if (Object.keys(usedAttrsInRules).length > 0) {
    setLayoutStore("usedAttrs", usedAttrsInRules);
    return;
  }
  batch(() => {
    if (layoutStore.selectedId === layoutVertex.id) {
      setLayoutStore("selectedId", -1);
      setLayoutStore("selectedComponent", -1);
    }
    if (layoutStore.hoverId === layoutVertex.id) {
      setLayoutStore("hoverId", -1);
    }
  });

  deleteNestedLayout(graph, setGraph, txnId, [layoutVertex]);
  if (name) {
    showSuccessToast(`${name} deleted successfully`);
  }
}
