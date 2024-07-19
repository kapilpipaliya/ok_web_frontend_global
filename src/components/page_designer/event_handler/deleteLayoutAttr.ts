import type { SetStoreFunction, Store } from "solid-js/store";

import { batch } from "solid-js";

import type { PageLayoutObject } from "~/components/page_designer/LayoutContext";
import type { GraphInterface, Vertex } from "~/lib/graph/graph";

import { deleteNestedLayout } from "../../../lib/graph/mutate/deleteNestedLayout";
import { allFormAttrsInPageFromLevel, getAllFieldsUsedInAllRules, getAllFieldsUsedInRootLevelSetting, isAttrUsedInRules } from "../functions/getChildrenAttrs";

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
  const usedAttrs = getAllFieldsUsedInAllRules(graph, setGraph, layoutStore.formData.formData);
  const usedAttrsInRules = isAttrUsedInRules(layoutVertex, usedAttrs, graph);

  let shouldReturn = false;

  if (Object.keys(usedAttrsInRules).length > 0) {
    setLayoutStore("usedAttrsInRules", usedAttrsInRules);
    shouldReturn = true;
  }

  const usedAttrsInUniqueConstraints = getAllFieldsUsedInRootLevelSetting(graph, setGraph, layoutStore.formData.formData, layoutVertex, "->$0Unique->$0Key");

  if (usedAttrsInUniqueConstraints.length > 0) {
    setLayoutStore("usedAttrsInUniqueConstraints", usedAttrsInUniqueConstraints);
    shouldReturn = true;
  }

  const usedAttrsInNameKeys = getAllFieldsUsedInRootLevelSetting(graph, setGraph, layoutStore.formData.formData, layoutVertex, "->$0NameKey");

  if (usedAttrsInNameKeys.length > 0) {
    setLayoutStore("usedAttrsInNameKeys", usedAttrsInNameKeys);
    shouldReturn = true;
  }


  if (layoutStore.formData.formData.L[0] === "Form") {
    const childContainsFormAttr = allFormAttrsInPageFromLevel(graph, layoutVertex, "Form");

    if (childContainsFormAttr.length > 0) {
      const rootContainsFormAttrExcludingChild = allFormAttrsInPageFromLevel(graph, layoutStore.formData.formData, "Form", childContainsFormAttr);
  
      if (rootContainsFormAttrExcludingChild.length === 0) {
        setLayoutStore("shouldContainAtLeastOneForm", true);
        shouldReturn = true;
      }
    }
  }


  if (shouldReturn) {
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