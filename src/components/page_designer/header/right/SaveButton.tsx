import { Icon } from "@iconify-icon/solid";
import { createMemo } from "solid-js";

import { formSubmit } from "~/components/form/formSubmit";
import { Tooltip } from "~/components/solid_blocks/tooltip/tooltip";
import { useGraph } from "~/lib/graph/graph";
import { isDisabledTxn } from "~/lib/graph/transaction/isDisabledTxn";

import { useDesignerLayoutStore } from "../../LayoutContext";

export function SaveButton() {
  const [layoutStore] = useDesignerLayoutStore();
  const [graph] = useGraph();

  const onSubmit = formSubmit(
    layoutStore.formData
  );
  const isDisabled = createMemo(() => !!layoutStore.formData.txnId && isDisabledTxn(layoutStore.formData.txnId, graph));

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
