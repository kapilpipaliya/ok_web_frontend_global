import { createMemo } from "solid-js";

import { useFormContext } from "~/components/form/FormContext";
import { formSubmit } from "~/components/form/functions/formSubmit";
import { IconButton } from "~/components/styled/IconButton";
import { useGraph, type Vertex } from "~/lib/graph/graph";
import { isDisabledTxn } from "~/lib/graph/transaction/isDisabledTxn";
import { headerIconButtonClass } from "~/pages/admin_layout/constant";
import type { FormStoreObject } from "~/components/form/FormContext";
export function SaveIconButton() {
  const formId = useFormContext();
  const [graph] = useGraph();

  const formVertex = () => formId ? graph.vertexes[formId] as Vertex<FormStoreObject> : undefined;
  const txnId = () => formVertex()?.P.txnId;

  const onSubmit = formSubmit();
  const isDisabled = createMemo(
    () => !!txnId() && isDisabledTxn(txnId()!, graph),
  );

  return (
    <IconButton
      class={`${isDisabled() ? "cursor:not-allowed" : ""} ${headerIconButtonClass}`}
      icon="bi:floppy"
      onClick={onSubmit}
      size={22}
      title="Save"
    />
  );
}
