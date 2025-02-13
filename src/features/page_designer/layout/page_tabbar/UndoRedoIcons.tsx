import { For } from "solid-js";

import type { FormStoreObject } from "~/components/form/context/FormContext";

import { IconButton } from "~/components/styled/IconButton";
import { useGraph, type Vertex } from "~/lib/graph/graph";
import { redo, redoAllowed } from "~/lib/graph/transaction/redo";
import { undo, undoAllowed } from "~/lib/graph/transaction/undo";
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
    <div class="flex ai:center gap:2">
      <For each={icons}>
        {(item) => (
          <IconButton
            class={`${
              item.disabled()
                ? "cursor:not-allowed opacity:.5"
                : "hover:color:#000"
            } flex ai:center b:1px|solid|lightgrey bg:base-5 color:grey jc:center p:6 r:7`}
            icon={item.icon}
            onClick={item.onClick}
            size={22}
            title={item.tooltip}
          />
        )}
      </For>
    </div>
  );
}
