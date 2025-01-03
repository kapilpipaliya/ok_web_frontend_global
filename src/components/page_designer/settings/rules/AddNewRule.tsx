import { createSignal, onCleanup, Show } from "solid-js";

import { insertNewRow } from "~/components/fields/table_field/insertNewRow";
import { ZIndex } from "~/components/fields/ZIndex";
import { useGraph, type Vertex } from "~/lib/graph/graph";
import { addNewVertex, newVertex } from "~/lib/graph/mutate/vertex";
import { getLastTxnIndex } from "~/lib/graph/transaction/getLastTxnIndex";
import { revertTransaction } from "~/lib/graph/transaction/revertTransaction";
import { FormMetaData } from "~/lib/meta/formMetaData";

import { useDesignerLayoutStore } from "../../context/LayoutContext";
import { RulesModal } from "../../rules/RulesModal";
import { CommonAddComponent } from "./CommonAddComponent";

export function AddNewRule(
  props: Readonly<{ onClose: (rowVertex?: Vertex) => void }>,
) {
  const [graph, setGraph] = useGraph();
  const [layoutStore] = useDesignerLayoutStore();
  const prevTxnIndex = getLastTxnIndex(layoutStore.formStore[0].txnId, graph);
  const [selectedRule, setSelectedRule] = createSignal<Vertex>();
  const metaTxnId = graph.newTxnId();

  onCleanup(() => {
    revertTransaction(metaTxnId, graph);
  });

  const addNewState = (key: string) => {
    const rulesMetaVertexId = graph.newVertexId();

    const metaAttribute = FormMetaData.Form.attributes.find(
      (x) => x.key === "Rule",
    )!;
    addNewVertex(
      metaTxnId,
      newVertex(rulesMetaVertexId, ["Attr"], metaAttribute),
      graph,
      setGraph,
    );

    const rowResult = insertNewRow(
      layoutStore.formStore[0].txnId,
      graph.vertexes[rulesMetaVertexId],
      graph.vertexes[layoutStore.formStore[0]?.formDataId!],
      false,
      graph,
      setGraph,
      { key },
    );

    const rule = graph.vertexes[rowResult!.vertexId!];

    const condMetaVertexId = graph.newVertexId();
    const condMetaAttribute = metaAttribute.attributes!.find(
      (x) => x.key === "cond",
    )!;
    addNewVertex(
      metaTxnId,
      newVertex(condMetaVertexId, ["Attr"], condMetaAttribute),
      graph,
      setGraph,
    );

    insertNewRow(
      layoutStore.formStore[0].txnId,
      graph.vertexes[condMetaVertexId],
      rule,
      false,
      graph,
      setGraph,
    );

    setSelectedRule(rule);
  };

  return (
    <CommonAddComponent
      addNewState={addNewState}
      label="Enter Rule Name"
      onClose={props.onClose}
      placeholder="Enter Rule key"
      title="Add New Rule"
    >
      <Show when={selectedRule()}>
        <ZIndex>
          <RulesModal
            closeModal={props.onClose}
            onSubmit={() => {
              props.onClose(selectedRule());
            }}
            prevTxnIndex={prevTxnIndex}
            selectedRule={selectedRule()}
          />
        </ZIndex>
      </Show>
    </CommonAddComponent>
  );
}
