import { Icon } from "@iconify-icon/solid";
import { useNavigate } from "@solidjs/router";
import { useContext } from "solid-js";

import { useToast } from "~/components/Toast";
import { formSubmit } from "~/components/form/formSubmit";
import { Tooltip } from "~/components/solid_blocks/tooltip/tooltip";
import { GraphContext } from "~/lib/graph/graph";
import { getNewTxnId } from "~/lib/graph/transaction";

import { useDesignerLayoutStore } from "../LayoutContext";

export function SaveButton() {
  const [layoutStore] = useDesignerLayoutStore();
  const { showErrorToast, showLoadingToast, showWarningToast } = useToast();
  const [graph, setGraph] = useContext(GraphContext)!;
  const txnId = getNewTxnId(graph, setGraph);
  const navigate = useNavigate();

  const onSubmit = async () => {
    return formSubmit(
      layoutStore.formData,
      layoutStore.formData.formData.id,
      txnId,
      graph,
      setGraph,
      showLoadingToast,
      showWarningToast,
      showErrorToast,
      () => navigate(-1)
    );
  };

  return (
    <Tooltip content={"Save"} position={"s"}>
      <button
        class="flex ai:center b:1px|solid|lightgrey bg:white color:grey color:#000:hover cursor:pointer h:35px jc:center r:7 w:37px"
        onClick={onSubmit}
        type="button"
      >
        <Icon height={22} icon={"bi:floppy"} width={22} />
      </button>
    </Tooltip>
  );
}
