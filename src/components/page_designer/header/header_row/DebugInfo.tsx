import { Show } from "solid-js";

import { useGraph } from "~/lib/graph/graph";

import { useDesignerLayoutStore } from "../../context/LayoutContext";

export function DebugInfo() {
  const [graph] = useGraph();
  const [layoutStore] = useDesignerLayoutStore();
  return (
    <Show when={layoutStore.formStore[0]?.txnId && graph.isDevelopment}>
      <div class="flex flex:row gap:2">
        <span>Txn ID: {layoutStore.formStore[0].txnId}</span>
        <span>
          Steps:{" "}
          {graph.vertexes[`txn${layoutStore.formStore[0].txnId}`]?.P.steps.length}
        </span>
        <span>
          Submitted Step:{" "}
          {graph.vertexes[`txn${layoutStore.formStore[0].txnId}`]?.P.submittedIndex}
        </span>
        <span>
          Active Undo Point Index:{" "}
          {graph.vertexes[`txn${layoutStore.formStore[0].txnId}`]?.P.activeUndoIndex}
        </span>
        <span>
          Undo Points:{" "}
          {graph.vertexes[`txn${layoutStore.formStore[0].txnId}`]?.P.undoStepIndexes.join(", ")}
        </span>
      </div>
    </Show>
  );
}
