import type { FormStoreObject } from "~/components/form/context/FormContext";
import { isDisabledTxn } from "~/lib/graph/transaction/value/isDisabledTxn";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";
import type { Id } from "~/lib/graph/type/id";
import type { Vertex } from "~/lib/graph/type/vertex";

import type { PageLayoutObject } from "../context/LayoutContext";

export interface UnsavedTabInfo {
  formId: Id;
  key: string;
  label: string;
  openedFormId: Id;
}

export function isFormUnsaved(graph: GraphInterface, formId: Id): boolean {
  const formStore = graph.vertexes[formId] as Vertex<FormStoreObject> | undefined;
  const txnId = formStore?.P?.txnId;
  return !!txnId && !isDisabledTxn(txnId, graph);
}

export function getUnsavedTabs(
  graph: GraphInterface,
  layoutStore: PageLayoutObject,
): UnsavedTabInfo[] {
  const result: UnsavedTabInfo[] = [];

  for (const openedFormId of layoutStore.openedFormIds) {
    const openVertex = graph.vertexes[openedFormId];
    const formId = openVertex?.P?.formId as Id | undefined;
    if (!formId) {
      continue;
    }

    const formStore = graph.vertexes[formId] as Vertex<FormStoreObject> | undefined;
    if (!formStore || !isFormUnsaved(graph, formId)) {
      continue;
    }

    const label = (openVertex.P.label as string) || "Item";
    const formDataId = formStore.P.formDataId;
    const key =
      (formDataId && (graph.vertexes[formDataId]?.P?.key as string | undefined)) ||
      "Untitled";

    result.push({ openedFormId, formId, label, key });
  }

  return result;
}
