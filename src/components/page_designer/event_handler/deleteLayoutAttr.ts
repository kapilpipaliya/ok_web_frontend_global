import type { SetStoreFunction, Store } from "solid-js/store";

import { batch } from "solid-js";

import type { PageLayoutObject } from "~/components/page_designer/context/LayoutContext";
import type { GraphInterface, Vertex } from "~/lib/graph/graph";
import { FormStoreObject } from "~/components/form/FormContext";
import { mergeVertexProperties } from "~/lib/graph/mutate/vertex";

import { deleteNestedLayout } from "../../../lib/graph/mutate/deleteNestedLayout";
import {
  allFormAttrsInPageFromLevel,
  getAllFieldsUsedInAllRules,
  getAllFieldsUsedInRootLevelSetting,
  isAttrUsedInRules,
} from "../functions/generateFormMetaAttributes";

function validateLayoutDeletion(
  layoutStoreId: string,
  layoutVertex: Vertex,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
): boolean {
  const layoutStore = () => graph.vertexes[layoutStoreId].P as PageLayoutObject;
  const formStoreVertex = () => graph.vertexes[layoutStore().formId!] as Vertex<FormStoreObject>;

  const usedAttrs = getAllFieldsUsedInAllRules(
    graph,
    setGraph,
    graph.vertexes[formStoreVertex().P.formDataId!],
  );
  const usedAttrsInRules = isAttrUsedInRules(layoutVertex, usedAttrs, graph);

  if (Object.keys(usedAttrsInRules).length > 0) {
    mergeVertexProperties<PageLayoutObject>(0, layoutStoreId, graph, setGraph, { usedAttrsInRules });
    return true;
  }

  const usedAttrsInUniqueConstraints = getAllFieldsUsedInRootLevelSetting(
    graph,
    setGraph,
    graph.vertexes[formStoreVertex().P.formDataId!],
    layoutVertex,
    "->$0Unique->$0Key",
  );

  if (usedAttrsInUniqueConstraints.length > 0) {
    mergeVertexProperties<PageLayoutObject>(0, layoutStoreId, graph, setGraph, { usedAttrsInUniqueConstraints });
    return true;
  }

  const usedAttrsInNameKeys = getAllFieldsUsedInRootLevelSetting(
    graph,
    setGraph,
    graph.vertexes[formStoreVertex().P.formDataId!],
    layoutVertex,
    "->$0NameKey",
  );

  if (usedAttrsInNameKeys.length > 0) {
    mergeVertexProperties<PageLayoutObject>(0, layoutStoreId, graph, setGraph, { usedAttrsInNameKeys });
    return true;
  }

  if (graph.vertexes[formStoreVertex().P.formDataId!]?.L[0] === "Form") {
    const childContainsFormAttr = allFormAttrsInPageFromLevel(
      graph,
      layoutVertex,
      "Form",
    );

    if (childContainsFormAttr.length > 0) {
      const rootContainsFormAttrExcludingChild = allFormAttrsInPageFromLevel(
        graph,
        graph.vertexes[formStoreVertex().P.formDataId!],
        "Form",
        childContainsFormAttr,
      );

      if (rootContainsFormAttrExcludingChild.length === 0) {
        mergeVertexProperties<PageLayoutObject>(0, layoutStoreId, graph, setGraph, { shouldContainAtLeastOneForm: true });
        return true;
      }
    }
  }

  return false;
}

export function deleteLayoutAttr(
  layoutStoreId: string,
  layoutVertex: Vertex,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  txnId: number,
  key: string,
  showSuccessToast: (message: string) => void,
) {
  const layoutStore = () => graph.vertexes[layoutStoreId].P as PageLayoutObject;

  if (
    validateLayoutDeletion(
      layoutStoreId,
      layoutVertex,
      graph,
      setGraph,
    )
  ) {
    return;
  }

  batch(() => {
    if (layoutStore().selectedId === layoutVertex.id) {
      mergeVertexProperties<PageLayoutObject>(0, layoutStoreId, graph, setGraph, {
        selectedId: -1,
        selectedComponent: -1
      });
    }
    if (layoutStore().hoverId === layoutVertex.id) {
      mergeVertexProperties<PageLayoutObject>(0, layoutStoreId, graph, setGraph, { hoverId: -1 });
    }
  });

  deleteNestedLayout(graph, setGraph, txnId, [layoutVertex]);
  if (key) {
    showSuccessToast(`${key} deleted successfully`);
  }
}
