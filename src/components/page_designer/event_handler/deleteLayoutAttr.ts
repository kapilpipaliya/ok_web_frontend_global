import type { SetStoreFunction, Store } from "solid-js/store";

import { batch } from "solid-js";

import type { PageLayoutObject } from "~/components/page_designer/context/LayoutContext";
import type { GraphInterface, Vertex } from "~/lib/graph/graph";

import { deleteNestedLayout } from "../../../lib/graph/mutate/deleteNestedLayout";
import {
  allFormAttrsInPageFromLevel,
  getAllFieldsUsedInAllRules,
  getAllFieldsUsedInRootLevelSetting,
  isAttrUsedInRules,
} from "../functions/generateFormMetaAttributes";

function validateLayoutDeletion(
  layoutStore: Store<PageLayoutObject>,
  setLayoutStore: SetStoreFunction<PageLayoutObject>,
  layoutVertex: Vertex,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
): boolean {
  const usedAttrs = getAllFieldsUsedInAllRules(
    graph,
    setGraph,
    graph.vertexes[layoutStore.formStore[0].formDataId!],
  );
  const usedAttrsInRules = isAttrUsedInRules(layoutVertex, usedAttrs, graph);

  if (Object.keys(usedAttrsInRules).length > 0) {
    setLayoutStore("usedAttrsInRules", usedAttrsInRules);
    return true;
  }

  const usedAttrsInUniqueConstraints = getAllFieldsUsedInRootLevelSetting(
    graph,
    setGraph,
    graph.vertexes[layoutStore.formStore[0].formDataId!],
    layoutVertex,
    "->$0Unique->$0Key",
  );

  if (usedAttrsInUniqueConstraints.length > 0) {
    setLayoutStore(
      "usedAttrsInUniqueConstraints",
      usedAttrsInUniqueConstraints,
    );
    return true;
  }

  const usedAttrsInNameKeys = getAllFieldsUsedInRootLevelSetting(
    graph,
    setGraph,
    graph.vertexes[layoutStore.formStore[0].formDataId!],
    layoutVertex,
    "->$0NameKey",
  );

  if (usedAttrsInNameKeys.length > 0) {
    setLayoutStore("usedAttrsInNameKeys", usedAttrsInNameKeys);
    return true;
  }

  if (graph.vertexes[layoutStore.formStore[0].formDataId!]?.L[0] === "Form") {
    const childContainsFormAttr = allFormAttrsInPageFromLevel(
      graph,
      layoutVertex,
      "Form",
    );

    if (childContainsFormAttr.length > 0) {
      const rootContainsFormAttrExcludingChild = allFormAttrsInPageFromLevel(
        graph,
        graph.vertexes[layoutStore.formStore[0].formDataId!],
        "Form",
        childContainsFormAttr,
      );

      if (rootContainsFormAttrExcludingChild.length === 0) {
        setLayoutStore("shouldContainAtLeastOneForm", true);
        return true;
      }
    }
  }

  return false;
}

export function deleteLayoutAttr(
  layoutStore: Store<PageLayoutObject>,
  setLayoutStore: SetStoreFunction<PageLayoutObject>,
  layoutVertex: Vertex,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  txnId: number,
  key: string,
  showSuccessToast: (message: string) => void,
) {
  if (
    validateLayoutDeletion(
      layoutStore,
      setLayoutStore,
      layoutVertex,
      graph,
      setGraph,
    )
  ) {
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
  if (key) {
    showSuccessToast(`${key} deleted successfully`);
  }
}
