import { createMemo } from "solid-js";

import { useFormContext } from "~/components/form/FormContext";
import { formSubmit } from "~/components/form/functions/formSubmit";
import { IconButton } from "~/components/IconButton";
import { useGraph } from "~/lib/graph/graph";
import { isDisabledTxn } from "~/lib/graph/transaction/isDisabledTxn";

export function SaveIconButton() {
  const formStore = useFormContext();
  const [graph] = useGraph();

  const onSubmit = formSubmit();
  const isDisabled = createMemo(
    () =>
      !!formStore?.[0]?.txnId && isDisabledTxn(formStore?.[0]?.txnId, graph),
  );

  return (
    <IconButton
      class={`${isDisabled() ? "cursor:not-allowed" : "color:#000:hover"} b:1px|solid|lightgrey bg:white color:grey  jc:center p:6 r:7`}
      icon="bi:floppy"
      onClick={onSubmit}
      size={22}
      title="Save"
    />
  );
}
