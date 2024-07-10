import { Icon } from "@iconify-icon/solid";
import { Show, createSignal, onCleanup } from "solid-js";

import { ZIndex } from "~/components/ZIndex";
import { insertNewRow } from "~/components/fields/table_input/insertNewRow";
import { PROPERTIES } from "~/components/page_designer/settings/properties/constant";
import { FormMetaData } from "~/lib/formMetaData";
import { type Vertex, useGraph } from "~/lib/graph/graph";
import { addNewVertex, newVertex } from "~/lib/graph/mutate/vertex";
import { revertTransaction } from "~/lib/graph/transaction/revertTransaction";

import { useDesignerLayoutStore } from "../../LayoutContext";
import { RulesModal } from "../properties/rules/RulesModal";

export function AddNewState(props: Readonly<{ onClose: () => void }>) {
  const [stateName, setStateName] = createSignal("");
  const [graph, setGraph] = useGraph();
  const [layoutStore] = useDesignerLayoutStore();
  let inputRef: HTMLInputElement;
  const prevTxnIndex = graph.transactions.get(layoutStore.formData.txnId)?.steps?.length ?? 0;
  const [selectedRule, setSelectedRule] = createSignal<Vertex>();
  const metaTxnId = graph.newTxnId;
  onCleanup(() => {
    revertTransaction(metaTxnId, graph);
  });

  const addNewState = () => {
    const metaVertexId = graph.newVertexId;

    const metaAttribute = FormMetaData.Form.attributes.find(
      (x) => x.name === "Rules"
    )!;
    addNewVertex(
      metaTxnId,
      newVertex(metaVertexId, ["MetaAttr"], metaAttribute),
      graph,
      setGraph
    );

    const rowResult = insertNewRow(layoutStore.formData.txnId, graph.vertexes[metaVertexId], layoutStore.formData.formData, false, graph, setGraph, { name: stateName() });

    const rule = graph.vertexes[rowResult!.vertexId!];
    setSelectedRule(rule);
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
            <RulesModal prevTxnIndex={prevTxnIndex} selectedRule={selectedRule()} toggleModal={props.onClose} />
          </ZIndex>
        </Show>
      </div>
    </div>
  );
}


