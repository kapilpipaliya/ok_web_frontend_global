import { Show, createSignal, onCleanup } from "solid-js";

import { ZIndex } from "~/components/ZIndex";
import { insertNewRow } from "~/components/fields/table_field/insertNewRow";
import { type Vertex, useGraph } from "~/lib/graph/graph";
import { addNewVertex, newVertex } from "~/lib/graph/mutate/vertex";
import { getLastTxnIndex } from "~/lib/graph/transaction/getLastTxnIndex";
import { revertTransaction } from "~/lib/graph/transaction/revertTransaction";
import { FormMetaData } from "~/lib/meta/formMetaData";

import { useDesignerLayoutStore } from "../../LayoutContext";
import { RulesModal } from "../../rules/RulesModal";
import { CommonAddComponent } from "./CommonAddComponent";

export function AddNewRule(
  props: Readonly<{ onClose: (rowVertex?: Vertex) => void }>,
) {
  const [graph, setGraph] = useGraph();
  const [layoutStore] = useDesignerLayoutStore();
  const prevTxnIndex = getLastTxnIndex(layoutStore.formStore[0].txnId, graph);
  const [selectedRule, setSelectedRule] = createSignal<Vertex>();
  const metaTxnId = graph.newTxnId;

  onCleanup(() => {
    revertTransaction(metaTxnId, graph);
  });

  const addNewState = (name: string) => {
    const rulesMetaVertexId = graph.newVertexId;

    const metaAttribute = FormMetaData.Form.attributes.find(
      (x) => x.name === "Rule",
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
      layoutStore.formStore[0].formData,
      false,
      graph,
      setGraph,
      { name },
    );

    const rule = graph.vertexes[rowResult!.vertexId!];

    const condMetaVertexId = graph.newVertexId;
    const condMetaAttribute = metaAttribute.attributes!.find(
      (x) => x.name === "cond",
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
      placeholder="Enter Rule name"
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
