import { Icon } from "@iconify-icon/solid";
import { Tooltip } from "~/components/solid_blocks/tooltip/tooltip";
import { useDesignerLayoutStore } from "../LayoutContext";

export function PreviewButton() {
  const [layoutStore] = useDesignerLayoutStore();
  return (
    <Tooltip content={"Preview"} position={"s"}>
      <button
        type="button"
        onClick={() => window.open(
          `/view/${layoutStore.formData.formData.L[0]}/${layoutStore.formData.formData.P.name}/preview`
        )}
        class="b:1px|solid|lightgrey bg:white color:#000:hover color:grey flex ai:center jc:center r:7 h:35px w:37px cursor:pointer"
      >
        <Icon icon={"ph:eye"} height={22} width={22} />
      </button>
    </Tooltip>
  );
}
