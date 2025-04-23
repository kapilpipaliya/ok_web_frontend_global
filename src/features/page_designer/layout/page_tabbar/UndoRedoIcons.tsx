import { For } from "solid-js";

import type { FormStoreObject } from "~/components/form/context/FormContext";
import type { Vertex } from "~/lib/graph/graph";

import { IconButton } from "~/components/styled/IconButton";
import { useGraph } from "~/lib/graph/GraphContext";
import { redo, redoAllowed } from "~/lib/graph/transaction/history/redo";
import { undo, undoAllowed } from "~/lib/graph/transaction/history/undo";
import { headerIconButtonCss } from "~/pages/settings/constants";
import { css } from "~/lib/styles";
import { As } from "~/components/As";

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
    <As
      as="div"
      css={css`
  margin-left: 2px;
  display: flex;
  align-items: center;
  gap: 2px;
`}
    >
      <For each={icons}>
        {(item) => (
          <IconButton
            css={headerIconButtonCss}
            disabled={item.disabled()}
            icon={item.icon}
            onClick={item.onClick}
            size={18}
            title={item.tooltip}
            tooltipGroup="page-buttons"
          />
        )}
      </For>
    </As>
  );
}
