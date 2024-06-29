import { For, } from "solid-js";
import { Icon } from "@iconify-icon/solid";
import { Tooltip } from "~/components/solid_blocks";
import { redo, undo } from "~/lib/graph/transaction";
import { useDesignerLayoutStore } from "./LayoutContext";

export function UndoRedoIcons() {
  const [pageConfig, __] = useDesignerLayoutStore();
  const icons = [
    { icon: "ci:arrow-undo-up-left", tooltip: "Undo", onClick: () => undo(pageConfig.formData.txnId) },
    { icon: "ci:arrow-undo-up-right", tooltip: "Redo", onClick: () => redo(pageConfig.formData.txnId) },
  ];

  return (
    <>
      <For each={icons}>
        {(item) => (
          <Tooltip content={item.tooltip} position={"n"}>
            <div
              class="b:1px|solid|lightgrey bg:white color:#000:hover color:grey flex ai:center jc:center r:7 h:30px w:30px cursor:pointer"
              onClick={item.onClick}
            >
              <Icon icon={item.icon} height={22} width={22} />
            </div>
          </Tooltip>
        )}
      </For>
    </>
  );
}
