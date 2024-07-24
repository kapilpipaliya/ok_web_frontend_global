
import { For } from "solid-js";

import { IconButton } from "~/components/IconButton";
import { useGraph } from "~/lib/graph/graph";
import { redo, redoAllowed } from "~/lib/graph/transaction/redo";
import { undo, undoAllowed } from "~/lib/graph/transaction/undo";

import { useDesignerLayoutStore } from "../../LayoutContext";

export function UndoRedoIcons() {
  const [layoutStore] = useDesignerLayoutStore();
  const [graph] = useGraph();
  const icons = [
    {
      disabled: () => !undoAllowed(layoutStore.formData?.txnId, graph),
      icon: "ci:arrow-undo-up-left",
      onClick: () => undo(layoutStore.formData.txnId, graph),
      tooltip: "Undo",
    },
    {
      disabled: () => !redoAllowed(layoutStore.formData?.txnId, graph),
      icon: "ci:arrow-undo-up-right",
      onClick: () => redo(layoutStore.formData.txnId, graph),
      tooltip: "Redo",
    },
  ];

  return (
    <div class="flex ai:center gap:2">
      <For each={icons}>
        {(item) => (
          <IconButton
            class={`${
              item.disabled() ? 'cursor:not-allowed opacity:.5' : 'hover:color:#000'
            } flex ai:center b:1px|solid|lightgrey bg:white color:grey jc:center p:6 r:7`}
            icon={item.icon}
            onClick={item.onClick}
            size={22}
            title={item.tooltip}
          />)}
      </For>
    </div>
  );
}
