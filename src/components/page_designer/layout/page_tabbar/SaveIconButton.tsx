import { createMemo } from "solid-js";

import { FormStoreObject, useFormContext } from "~/components/form/context/FormContext";
import { formSubmit } from "~/components/form/functions/formSubmit";
import { IconButton } from "~/components/styled/IconButton";
import { useGraph, type Vertex } from "~/lib/graph/graph";
import { isDisabledTxn } from "~/lib/graph/transaction/isDisabledTxn";
import { useToast } from "~/components/styled/Toast";
import { headerIconButtonClass } from "~/pages/admin_layout/constant";

export function SaveIconButton(props: { formStoreId: string }) {
  const [graph, setGraph] = useGraph();
  const { showErrorToast, showLoadingToast, showWarningToast } = useToast();
  const formStoreVertex = () => graph.vertexes[props.formStoreId!] as Vertex<FormStoreObject>;
  const txnId = () => formStoreVertex()?.P.txnId;

  const isDisabled = createMemo(
    () => !!txnId() && isDisabledTxn(txnId()!, graph),
  );

  return (
    <IconButton
      class={`${isDisabled() ? "cursor:not-allowed" : ""} ${headerIconButtonClass}`}
      icon="ph:floppy-disk"
      onClick={() => formSubmit(formStoreVertex, graph, setGraph, () => {}, showErrorToast, showLoadingToast, showWarningToast)()}
      size={22}
      title="Save"
    />
  );
}
