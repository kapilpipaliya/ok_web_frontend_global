import { createMemo } from "solid-js";

import { FormStoreObject, useFormContext } from "~/components/form/context/FormContext";
import { formSubmit } from "~/components/form/functions/formSubmit";
import { IconButton } from "~/components/styled/IconButton";
import { useGraph, type Vertex } from "~/lib/graph/graph";
import { isDisabledTxn } from "~/lib/graph/transaction/isDisabledTxn";
import { headerIconButtonClass } from "~/pages/admin_layout/constant";
import { PageLayoutObject, useDesignerFormIdContext } from "../../context/LayoutContext";
import { useDesignerLayoutStore } from "../../context/LayoutContext";
import { useToast } from "~/components/styled/Toast";

export function SaveIconButton() {
  const [graph, setGraph] = useGraph();
  const formStoreId = useDesignerFormIdContext();
  const { showErrorToast, showLoadingToast, showWarningToast } = useToast();
  const formStoreVertex = () => graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;
  const txnId = () => formStoreVertex()?.P.txnId;

  const isDisabled = createMemo(
    () => !!txnId() && isDisabledTxn(txnId()!, graph),
  );

  return (
    <IconButton
      class={`${isDisabled() ? "cursor:not-allowed" : ""} ${headerIconButtonClass}`}
      icon="bi:floppy"
      onClick={() => formSubmit(formStoreVertex, graph, setGraph, () => {}, showErrorToast, showLoadingToast, showWarningToast)()}
      size={22}
      title="Save"
    />
  );
}
