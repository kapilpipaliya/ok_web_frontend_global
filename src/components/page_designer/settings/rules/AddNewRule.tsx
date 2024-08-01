
import { Show, createSignal, onCleanup, onMount } from "solid-js";

import { IconButton } from "~/components/IconButton";
import { ZIndex } from "~/components/ZIndex";
import { insertNewRow } from "~/components/fields/table_field/insertNewRow";
import { PROPERTIES } from "~/components/page_designer/settings/properties/constant";
import { type Vertex, useGraph } from "~/lib/graph/graph";
import { addNewVertex, newVertex } from "~/lib/graph/mutate/vertex";
import { getLastTxnIndex } from "~/lib/graph/transaction/getLastTxnIndex";
import { revertTransaction } from "~/lib/graph/transaction/revertTransaction";
import { FormMetaData } from "~/lib/meta/formMetaData";

import { useDesignerLayoutStore } from "../../LayoutContext";
import { RulesModal } from "../../rules/RulesModal";

export function AddNewRule(
  props: Readonly<{ onClose: (rowVertex?: Vertex) => void }>,
) {
  const [stateName, setStateName] = createSignal("");
  const [graph, setGraph] = useGraph();
  const [layoutStore] = useDesignerLayoutStore();
  let inputRef: HTMLInputElement;
  const prevTxnIndex = getLastTxnIndex(layoutStore.formStore.txnId, graph);
  const [selectedRule, setSelectedRule] = createSignal<Vertex>();
  const metaTxnId = graph.newTxnId;

  onCleanup(() => {
    revertTransaction(metaTxnId, graph);
  });

  const addNewState = () => {
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
      layoutStore.formStore.txnId,
      graph.vertexes[rulesMetaVertexId],
      layoutStore.formStore.formData,
      false,
      graph,
      setGraph,
      { name: stateName() },
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
      layoutStore.formStore.txnId,
      graph.vertexes[condMetaVertexId],
      rule,
      false,
      graph,
      setGraph,
    );

    setSelectedRule(rule);
  };
  onMount(() => inputRef?.focus());

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      addNewState();
    }
  };

  return (
    <div class="radius-b:5 flex flex:column px:2 py:5">
      <span>Add New Rule</span>
      <div class="flex flex:column gap:4 jc:space-between mt:10">
        <label class="flex flex:column">
          Enter Rule Name
          <div class="items-center flex ">
            <input
              class={`${PROPERTIES.Css.TextBox} h:100%`}
              onInput={(e) => setStateName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter Rule Name"
              ref={inputRef!}
              value={stateName()}
            />
          </div>
        </label>
        <IconButton
          icon="ic:round-check"
          iconClass="ml:2"
          onClick={addNewState}
          size={21}
        />
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
      </div>
    </div>
  );
}
