import type { FormStoreObject } from "~/components/form/context/FormContext";
import type { Id, Vertex } from "~/lib/graph/graph";

import { formSubmit } from "~/components/form/functions/formSubmit";
import { IconButton } from "~/components/styled/IconButton";
import { useToast } from "~/components/styled/modal/Toast";
import { useGraph } from "~/lib/graph/GraphContext";
import { isDisabledTxn } from "~/lib/graph/transaction/value/isDisabledTxn";
import { capturePreview } from "~/lib/playwright/capturePreview";
import { headerIconButtonCss } from "~/pages/settings/constants";

import type { PageLayoutObject } from "../../context/LayoutContext";
import { useDesignerLayoutStore } from "../../context/LayoutContext";

export function SaveAllButton() {
  const [graph, setGraph] = useGraph();
  const { showErrorToast, showLoadingToast, showWarningToast } = useToast();
  const layoutStoreId = useDesignerLayoutStore();
  const layoutStore = () =>
    (graph.vertexes[layoutStoreId]?.P as PageLayoutObject) || {};

  const formStoreIds = () => layoutStore().openedFormIds.slice().reverse();

  const isDisabled = (formId: Id) => {
    const formStoreVertex = () =>
      graph.vertexes[formId] as Vertex<FormStoreObject>;
    const txnId = () => formStoreVertex()?.P.txnId;
    return !!txnId() && isDisabledTxn(txnId()!, graph);
  };

  const saveAndCaptureForm = async (openFormData: Id) => {
    const formStoreVertex = () =>
      graph.vertexes[
        graph.vertexes[openFormData].P.formId
      ] as Vertex<FormStoreObject>;

    // Save the form
    const formSubmitError = await formSubmit(
      formStoreVertex,
      graph,
      setGraph,
      () => {},
      showErrorToast,
      showLoadingToast,
      showWarningToast,
    )();

    // If form saved successfully, capture preview
    if (!formSubmitError) {
      return capturePreview(formStoreVertex, graph, setGraph, showErrorToast);
    }

    return false;
  };

  const handleSaveAll = async () => {
    const idsToSave = formStoreIds().filter(
      (openFormData) => !isDisabled(graph.vertexes[openFormData].P.formId),
    );

    // Process forms sequentially to avoid UI conflicts
    for (const openFormData of idsToSave) {
      await saveAndCaptureForm(openFormData);
    }
  };

  return (
    <IconButton
      css={headerIconButtonCss}
      disabled={formStoreIds().every((openFormData) =>
        isDisabled(graph.vertexes[openFormData].P.formId),
      )}
      icon="ic:baseline-save-all"
      onClick={
        formStoreIds().every((openFormData) =>
          isDisabled(graph.vertexes[openFormData].P.formId),
        )
          ? undefined
          : handleSaveAll
      }
      size={22}
      title="Save All"
      tooltipGroup="right-buttons"
    />
  );
}
