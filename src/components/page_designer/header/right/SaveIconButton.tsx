import { Icon } from "@iconify-icon/solid";
import { createMemo } from "solid-js";

import { formSubmit } from "~/components/form/formSubmit";
import { useFormContext } from "~/lib/contexts";
import { useGraph } from "~/lib/graph/graph";
import { isDisabledTxn } from "~/lib/graph/transaction/isDisabledTxn";

export function SaveIconButton() {
  const formData = useFormContext();
  const [graph] = useGraph();

  const onSubmit = formSubmit();
  const isDisabled = createMemo(
    () => !!formData.txnId && isDisabledTxn(formData.txnId, graph),
  );

  return (

      <button
        class={`${isDisabled() ? "cursor:not-allowed" : "color:#000:hover cursor:pointer"} flex ai:center b:1px|solid|lightgrey bg:white color:grey  jc:center p:6 r:7`}
        disabled={isDisabled()}
        onClick={onSubmit}
        title="Save"
        type="button"
      >
        <Icon height={22} icon={"bi:floppy"} width={22} />
      </button>

  );
}
