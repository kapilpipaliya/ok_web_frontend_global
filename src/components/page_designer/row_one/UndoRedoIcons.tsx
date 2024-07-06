import { Icon } from "@iconify-icon/solid";
import { For, } from "solid-js";

import { Tooltip } from "~/components/solid_blocks";
import { redo } from "~/lib/graph/transaction/redo";
import { undo } from "~/lib/graph/transaction/undo";

import { useDesignerLayoutStore } from "../LayoutContext";

export function UndoRedoIcons() {
  const [layoutStore, __] = useDesignerLayoutStore();
  const icons = [
    { icon: "ci:arrow-undo-up-left", onClick: () => undo(layoutStore.formData.txnId), tooltip: "Undo" },
    { icon: "ci:arrow-undo-up-right", onClick: () => redo(layoutStore.formData.txnId), tooltip: "Redo" },
  ];

  return (
    <For each={icons}>
      {(item) => (
        <Tooltip content={item.tooltip} position={"n"}>
          <button
            class="flex ai:center b:1px|solid|lightgrey bg:white color:grey color:#000:hover cursor:pointer h:30px jc:center r:7 w:30px"
            onClick={item.onClick}
            type="button"
          >
            <Icon height={22} icon={item.icon} width={22} />
          </button>
        </Tooltip>
      )}
    </For>
  );
}
