import { createMemo } from "solid-js";

import type { FormStoreObject } from "~/components/form/context/FormContext";
import type { Vertex } from "~/lib/graph/graph";

import { formSubmit } from "~/components/form/functions/formSubmit";
import { IconButton } from "~/components/styled/IconButton";
import { useToast } from "~/components/styled/modal/Toast";
import { useGraph } from "~/lib/graph/GraphContext";
import { isDisabledTxn } from "~/lib/graph/transaction/value/isDisabledTxn";
import { capturePreview } from "~/lib/playwright/capturePreview";
import { headerIconButtonCss } from "~/pages/settings/constants";

export function SaveIconButton(props: { formStoreId: string }) {
  const [graph, setGraph] = useGraph();
  const { showErrorToast, showLoadingToast, showWarningToast } = useToast();
  const formStoreVertex = () =>
    graph.vertexes[props.formStoreId!] as Vertex<FormStoreObject>;
  const txnId = () => formStoreVertex()?.P.txnId;

  const isDisabled = createMemo(
    () => !!txnId() && isDisabledTxn(txnId()!, graph),
  );

  const saveAndCaptureForm = async () => {
    // Call form submit
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
      await capturePreview(formStoreVertex, graph, setGraph, showErrorToast);
    }

    return !formSubmitError;
  };

  return (
    <IconButton
      css={headerIconButtonCss}
      disabled={isDisabled()}
      icon="ph:floppy-disk"
      onClick={isDisabled() ? undefined : saveAndCaptureForm}
      size={22}
      title="Save"
      tooltipGroup="page-buttons"
    />
  );
}
