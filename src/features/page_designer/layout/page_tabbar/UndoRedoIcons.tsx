import { For } from "solid-js";

import type { FormStoreObject } from "~/components/form/context/FormContext";

import { IconButton } from "~/components/styled/IconButton";
import { useGraph, type Vertex } from "~/lib/graph/graph";
import { redo, redoAllowed } from "~/lib/graph/transaction/history/redo";
import { undo, undoAllowed } from "~/lib/graph/transaction/history/undo";
import { headerIconButtonClass } from "~/pages/settings/constants";

export function UndoRedoIcons(props: { formStoreId: string }) {
  const [graph, setGraph] = useGraph();

  const formStoreVertex = () =>
    graph.vertexes[props.formStoreId!] as Vertex<FormStoreObject>;

  const icons = [
    {
      disabled: () => !undoAllowed(formStoreVertex()?.P.txnId, graph),
      icon: "ph:arrow-counter-clockwise",
      onClick: () => undo(formStoreVertex()?.P.txnId, graph, setGraph),
      tooltip: "Undo",
    },
    {
      disabled: () => !redoAllowed(formStoreVertex()?.P.txnId, graph),
      icon: "ph:arrow-clockwise",
      onClick: () => redo(formStoreVertex()?.P.txnId, graph, setGraph),
      tooltip: "Redo",
    },
  ];

  return (
    <div class="ml:2 flex ai:center gap:2">
      <For each={icons}>
        {(item) => (
          <IconButton
            class={`${
              item.disabled()
                ? "cursor:not-allowed opacity:.5"
                : "hover:color:#000"
            } ${headerIconButtonClass}`}
            icon={item.icon}
            onClick={item.onClick}
            size={22}
            title={item.tooltip}
            tooltipGroup="page-buttons"
          />
        )}
      </For>
    </div>
  );
}
