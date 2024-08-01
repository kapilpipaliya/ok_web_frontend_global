import { Show } from "solid-js";

import { useGraph } from "~/lib/graph/graph";

import { useDesignerLayoutStore } from "../../LayoutContext";

export function DebugInfo() {
  const [graph] = useGraph();
  const [layoutStore] = useDesignerLayoutStore();
  return (
    <Show when={layoutStore.formStore.txnId}>
      <div class="flex flex:row gap:2">
        <span>Txn ID: {layoutStore.formStore.txnId}</span>
        <span>Steps: {graph.transactions.get(layoutStore.formStore.txnId)?.steps.length}</span>
        <span>Submitted Step: {graph.transactions.get(layoutStore.formStore.txnId)?.submittedIndex}</span>
        <span>Active Undo Point Index: {graph.transactions.get(layoutStore.formStore.txnId)?.activeUndoIndex}</span>
        <span>Undo Points: {graph.transactions.get(layoutStore.formStore.txnId)?.undoStepIndexes.join(", ")}</span>
      </div>
    </Show>
  );
}
