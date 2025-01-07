import { createSignal, onCleanup, Show } from "solid-js";

import { insertNewRow } from "~/components/fields/table_field/insertNewRow";
import { ZIndex } from "~/components/fields/ZIndex";
import { useGraph, type Vertex } from "~/lib/graph/graph";
import { addNewVertex, newVertex } from "~/lib/graph/mutate/vertex";
import { getLastTxnIndex } from "~/lib/graph/transaction/getLastTxnIndex";
import { revertTransaction } from "~/lib/graph/transaction/revertTransaction";
import { FormMetaData } from "~/lib/meta/formMetaData";
import { FormStoreObject } from "~/components/form/context/FormContext";

import { useDesignerLayoutStore } from "../../context/LayoutContext";
import { RulesModal } from "../../rules/RulesModal";
import { CommonAddComponent } from "./CommonAddComponent";
import { generateNewTxnId } from "~/lib/graph/transaction/generateNewTxnId";
import { generateNewVertexId } from "~/lib/graph/transaction/generateNewVertexId";

export function AddNewRule(
  props: Readonly<{ onClose: (rowVertex?: Vertex) => void }>,
) {
  const [graph, setGraph] = useGraph();
  const layoutStoreId = useDesignerLayoutStore();
  
  const layoutStore = () => graph.vertexes[layoutStoreId].P;
  const formStoreVertex = () => graph.vertexes[layoutStore().formId!] as Vertex<FormStoreObject>;

  const prevTxnIndex = getLastTxnIndex(formStoreVertex().P.txnId, graph);
  const [selectedRule, setSelectedRule] = createSignal<Vertex>();
  const metaTxnId = generateNewTxnId(graph, setGraph);

  onCleanup(() => {
    revertTransaction(metaTxnId, graph, setGraph);
  });

  const addNewState = (key: string) => {
    const rulesMetaVertexId = generateNewVertexId(graph, setGraph);

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
      formStoreVertex().P.txnId,
      graph.vertexes[rulesMetaVertexId],
      graph.vertexes[formStoreVertex().P.formDataId!],
      false,
      graph,
      setGraph,
      { key },
    );

    const rule = graph.vertexes[rowResult!.vertexId!];

    const condMetaVertexId = generateNewVertexId(graph, setGraph);
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
      formStoreVertex().P.txnId,
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
