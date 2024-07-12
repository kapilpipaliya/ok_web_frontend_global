import { Icon } from "@iconify-icon/solid";
import { Show, createSignal, onCleanup, onMount } from "solid-js";

import { ZIndex } from "~/components/ZIndex";
import { insertNewRow } from "~/components/fields/table_input/insertNewRow";
import { PROPERTIES } from "~/components/page_designer/settings/properties/constant";
import { type Vertex, useGraph } from "~/lib/graph/graph";
import { addNewVertex, newVertex } from "~/lib/graph/mutate/vertex";
import { revertTransaction } from "~/lib/graph/transaction/revertTransaction";
import { FormMetaData } from "~/lib/meta/formMetaData";

import { useDesignerLayoutStore } from "../../LayoutContext";
import { RulesModal } from "../properties/rules/RulesModal";

export function AddNewRule(
  props: Readonly<{ onClose: (rowVertex?: Vertex) => void }>,
) {
  const [stateName, setStateName] = createSignal("");
  const [graph, setGraph] = useGraph();
  const [layoutStore] = useDesignerLayoutStore();
  let inputRef: HTMLInputElement;
  const prevTxnIndex =
    graph.transactions.get(layoutStore.formData.txnId)?.steps?.length ?? 0;
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
      newVertex(rulesMetaVertexId, ["MetaAttr"], metaAttribute),
      graph,
      setGraph,
    );

    const rowResult = insertNewRow(
      layoutStore.formData.txnId,
      graph.vertexes[rulesMetaVertexId],
      layoutStore.formData.formData,
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
      newVertex(condMetaVertexId, ["MetaAttr"], condMetaAttribute),
      graph,
      setGraph,
    );

    insertNewRow(
      layoutStore.formData.txnId,
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
        <button onClick={addNewState}>
          <Icon class="ml:2" height={21} icon="ic:round-check" width={21} />
        </button>
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
