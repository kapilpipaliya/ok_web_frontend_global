import type { SetStoreFunction } from "solid-js/store";

import { batch } from "solid-js";

import type { FormStoreObject } from "~/components/form/context/FormContext";
import type { GraphInterface, Vertex } from "~/lib/graph/graph";

import { mergeVertexProperties } from "~/lib/graph/mutate/vertex";

import { deleteNestedLayout } from "../../../lib/graph/mutate/deleteNestedLayout";
import {
  allFormAttrsInPageFromLevel,
  getAllFieldsUsedInAllRules,
  getAllFieldsUsedInRootLevelSetting,
  isAttrUsedInRules,
} from "../functions/generateFormMetaAttributes";

export function deleteLayoutAttr(
  formStoreVertex: Vertex<FormStoreObject>,
  layoutVertex: Vertex,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  txnId: number,
  key: string,
  showSuccessToast: (message: string) => void,
) {
  if (validateLayoutDeletion(formStoreVertex, layoutVertex, graph, setGraph)) {
    return;
  }

  batch(() => {
    if (formStoreVertex?.P.selectedId === layoutVertex.id) {
      mergeVertexProperties<FormStoreObject>(
        0,
        formStoreVertex.id!,
        graph,
        setGraph,
        {
          selectedId: -1,
        },
      );
    }
    if (formStoreVertex?.P.hoverId === layoutVertex.id) {
      mergeVertexProperties<FormStoreObject>(
        0,
        formStoreVertex.id!,
        graph,
        setGraph,
        { hoverId: -1 },
      );
    }
  });

  deleteNestedLayout(graph, setGraph, txnId, [layoutVertex]);
  if (key) {
    showSuccessToast(`${key} deleted successfully`);
  }
}

function validateLayoutDeletion(
  formStoreVertex: Vertex<FormStoreObject>,
  layoutVertex: Vertex,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
): boolean {
  const usedAttrs = getAllFieldsUsedInAllRules(
    graph,
    setGraph,
    graph.vertexes[formStoreVertex?.P.formDataId!],
  );
  const usedAttrsInRules = isAttrUsedInRules(layoutVertex, usedAttrs, graph);

  if (Object.keys(usedAttrsInRules).length > 0) {
    mergeVertexProperties<FormStoreObject>(
      0,
      formStoreVertex.id!,
      graph,
      setGraph,
      { usedAttrsInRules },
    );
    return true;
  }

  const usedAttrsInUniqueConstraints = getAllFieldsUsedInRootLevelSetting(
    graph,
    setGraph,
    graph.vertexes[formStoreVertex?.P.formDataId!],
    layoutVertex,
    "->$0Unique->$0Key",
  );

  if (usedAttrsInUniqueConstraints.length > 0) {
    mergeVertexProperties<FormStoreObject>(
      0,
      formStoreVertex.id!,
      graph,
      setGraph,
      { usedAttrsInUniqueConstraints },
    );
    return true;
  }

  const usedAttrsInNameKeys = getAllFieldsUsedInRootLevelSetting(
    graph,
    setGraph,
    graph.vertexes[formStoreVertex?.P.formDataId!],
    layoutVertex,
    "->$0NameKey",
  );

  if (usedAttrsInNameKeys.length > 0) {
    mergeVertexProperties<FormStoreObject>(
      0,
      formStoreVertex.id!,
      graph,
      setGraph,
      { usedAttrsInNameKeys },
    );
    return true;
  }

  if (graph.vertexes[formStoreVertex?.P.formDataId!]?.L[0] === "Form") {
    const childContainsFormAttr = allFormAttrsInPageFromLevel(
      graph,
      layoutVertex,
      "Form",
    );

    if (childContainsFormAttr.length > 0) {
      const rootContainsFormAttrExcludingChild = allFormAttrsInPageFromLevel(
        graph,
        graph.vertexes[formStoreVertex?.P.formDataId!],
        "Form",
        childContainsFormAttr,
      );

      if (rootContainsFormAttrExcludingChild.length === 0) {
        mergeVertexProperties<FormStoreObject>(
          0,
          formStoreVertex.id!,
          graph,
          setGraph,
          { shouldContainAtLeastOneForm: true },
        );
        return true;
      }
    }
  }

  return false;
}
