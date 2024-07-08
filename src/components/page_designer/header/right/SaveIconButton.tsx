import { Icon } from "@iconify-icon/solid";
import { createMemo } from "solid-js";

import { formSubmit } from "~/components/form/formSubmit";
import { Tooltip } from "~/components/solid_blocks/tooltip/tooltip";
import { useFormContext } from "~/lib/contexts";
import { useGraph } from "~/lib/graph/graph";
import { isDisabledTxn } from "~/lib/graph/transaction/isDisabledTxn";

export function SaveIconButton() {
  const formData = useFormContext();
  const [graph] = useGraph();

  const onSubmit = formSubmit();
  const isDisabled = createMemo(() => !!formData.txnId && isDisabledTxn(formData.txnId, graph));

  return (
    <Tooltip content={"Save"} position={"s"}>
      <button
        class={`${isDisabled() ? 'cursor:not-allowed' : 'color:#000:hover cursor:pointer'} flex ai:center b:1px|solid|lightgrey bg:white color:grey h:35px jc:center r:7 w:37px`}
        disabled={isDisabled()}
        onClick={onSubmit}
        type="button"
      >
        <Icon height={22} icon={"bi:floppy"} width={22} />
      </button>
    </Tooltip>
  );
}
