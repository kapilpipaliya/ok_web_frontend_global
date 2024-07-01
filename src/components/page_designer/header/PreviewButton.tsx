import { Icon } from "@iconify-icon/solid";

import { Tooltip } from "~/components/solid_blocks/tooltip/tooltip";

import { useDesignerLayoutStore } from "../LayoutContext";

export function PreviewButton() {
  const [layoutStore] = useDesignerLayoutStore();
  return (
    <Tooltip content={"Preview"} position={"s"}>
      <button
        class="flex ai:center b:1px|solid|lightgrey bg:white color:grey color:#000:hover cursor:pointer h:35px jc:center r:7 w:37px"
        onClick={() => window.open(
          `/view/${layoutStore.formData.formData.L[0]}/${layoutStore.formData.formData.P.name}/preview`
        )}
        type="button"
      >
        <Icon height={22} icon={"ph:eye"} width={22} />
      </button>
    </Tooltip>
  );
}
