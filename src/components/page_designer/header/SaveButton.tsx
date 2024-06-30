import { Icon } from "@iconify-icon/solid";
import { useContext } from "solid-js";
import { Tooltip } from "~/components/solid_blocks/tooltip/tooltip";
import { useNavigate } from "@solidjs/router";
import { useToast } from "~/components/Toast";
import { getNewTxnId } from "~/lib/graph/transaction";
import { GraphContext } from "~/lib/graph/graph";
import { useDesignerLayoutStore } from "../LayoutContext";
import { formSubmit } from "~/components/form/formSubmit";

export function SaveButton() {
  const [layoutStore] = useDesignerLayoutStore();
  const { showWarningToast, showLoadingToast, showErrorToast } = useToast();
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
        type="button"
        class="b:1px|solid|lightgrey bg:white color:#000:hover color:grey flex ai:center jc:center r:7 h:35px w:37px cursor:pointer"
        onClick={onSubmit}
      >
        <Icon icon={"bi:floppy"} height={22} width={22} />
      </button>
    </Tooltip>
  );
}
