import { Show } from "solid-js";

import type { FormStoreObject } from "~/components/form/context/FormContext";

import { getGlobalStore } from "~/lib/graph/get/sync/getGlobalStore";
import {
  type TransactionDetail,
  useGraph,
  type Vertex,
} from "~/lib/graph/graph";

export function DebugInfo(props: { formStoreId: string }) {
  const [graph] = useGraph();

  const formStoreVertex = () =>
    graph.vertexes[props.formStoreId!] as Vertex<FormStoreObject>;
  const tnxVertex = () =>
    graph.vertexes[
      `txn${formStoreVertex()?.P.txnId}`
    ] as Vertex<TransactionDetail>;

  return (
    <Show
      when={formStoreVertex()?.P.txnId && getGlobalStore(graph).P.isDevelopment}
    >
      <div class="flex flex:row gap:2">
        <span>Txn ID: {formStoreVertex()?.P.txnId}</span>
        <span>Steps: {tnxVertex()?.P.steps.length}</span>
        <span>Submitted Step: {tnxVertex()?.P.submittedIndex}</span>
        <span>Active Undo Point Index: {tnxVertex()?.P.activeUndoIndex}</span>
        <span>Undo Points: {tnxVertex()?.P.undoStepIndexes.join(", ")}</span>
      </div>
    </Show>
  );
}
