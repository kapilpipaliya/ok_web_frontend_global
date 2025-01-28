import { createMemo } from "solid-js";

import { FormStoreObject, useFormContext } from "~/components/form/context/FormContext";
import { formSubmit } from "~/components/form/functions/formSubmit";
import { IconButton } from "~/components/styled/IconButton";
import { Id, useGraph, type Vertex } from "~/lib/graph/graph";
import { isDisabledTxn } from "~/lib/graph/transaction/isDisabledTxn";
import { headerIconButtonClass } from "~/pages/admin_layout/constant";
import { PageLayoutObject, useDesignerFormIdContext } from "../../context/LayoutContext";
import { useDesignerLayoutStore } from "../../context/LayoutContext";
import { useToast } from "~/components/styled/Toast";

export function SaveAllButton() {
  const [graph, setGraph] = useGraph();
  const { showErrorToast, showLoadingToast, showWarningToast } = useToast();
  const layoutStoreId = useDesignerLayoutStore();
  const layoutStore = () => (graph.vertexes[layoutStoreId]?.P as PageLayoutObject) || {};
  
  const formStoreIds = () => layoutStore().openedFormIds.slice().reverse();

  const isDisabled = (formId: Id) => {
    const formStoreVertex = () => graph.vertexes[formId] as Vertex<FormStoreObject>;
    const txnId = () => formStoreVertex()?.P.txnId;
    return !!txnId() && isDisabledTxn(txnId()!, graph);
  };

  const handleSaveAll = async () => {
    const idsToSave = formStoreIds().filter(openFormData => !isDisabled(graph.vertexes[openFormData].P.formId));
    for (const openFormData of idsToSave) {
      const formStoreVertex = () => graph.vertexes[graph.vertexes[openFormData].P.formId] as Vertex<FormStoreObject>;
      await formSubmit(formStoreVertex, graph, setGraph, () => {}, showErrorToast, showLoadingToast, showWarningToast)();
    }
  };

  return (
    <IconButton
      class={`${headerIconButtonClass}`}
      icon="ic:baseline-save-all"
      onClick={formStoreIds().every(openFormData => isDisabled(graph.vertexes[openFormData].P.formId)) ? undefined : handleSaveAll}
      size={22}
      title="Save All"
      disabled={formStoreIds().every(openFormData => isDisabled(graph.vertexes[openFormData].P.formId))}
    />
  );
}
