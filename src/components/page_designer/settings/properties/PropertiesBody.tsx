import { Show, createSignal, useContext } from "solid-js";

import { setPropertyValueGlobal } from "~/lib/drag_drop/setPropertyValueGlobal";
import { getSelectionOptions } from "~/lib/graph/get/sync/traverse";
import { GraphContext, type Vertex } from "~/lib/graph/graph";

import { useDesignerLayoutStore } from "../../LayoutContext";
import { CollAndData } from "./CollAndData";
import { ImportModal } from "./import/ImportModal";
import { FormGroupProperties } from "./properties/FormGroupProperties";
import { RenderModal } from "./rules/RenderModal";
import { RulesModalBody } from "./rules/RulesModalBody";

export function PropertiesBody() {
  const [isRulesModalOpen, setIsRulesModalOpen] = createSignal(false);
  const [isImportModalOpen, setIsImportModalOpen] = createSignal(false);
  const [graph, setGraph] = useContext(GraphContext)!;
  const [layoutStore] = useDesignerLayoutStore();

  const setPropertyValue = (meta: Vertex, value: any) => {
    if (layoutStore.selectedId !== -1 && layoutStore.selectedComponent !== -1) {
      return setPropertyValueGlobal(
        graph,
        setGraph,
        layoutStore.formData.txnId,
        meta,
        graph.vertexes[layoutStore.selectedId],
        graph.vertexes[layoutStore.selectedComponent],
        value,
      );
    }
  };

  const selectedComponentProperties = () => {
    const selectedComp = graph.vertexes[layoutStore.selectedComponent];
    if (!selectedComp) return { error: true };
    return getSelectionOptions(graph, setGraph, "->$0Prop", [selectedComp]);
  };

  const toggleRulesModal = () => setIsRulesModalOpen(prev => !prev);
  const toggleImportsModal = () => setIsImportModalOpen(prev => !prev);


  return (
    <>
      <Show when={layoutStore.selectedId !== -1}>
        <div class="flex gap:2 jc:start">
          <button class="mb:5" onClick={toggleRulesModal}>Rules</button>
          <button onClick={toggleImportsModal}>Import HTML</button>
        </div>
        <CollAndData />
        <FormGroupProperties
          metaAttributes={selectedComponentProperties().vertexes ?? []}
          selectedLayout={graph.vertexes[layoutStore.selectedId]}
          setValue={setPropertyValue}
          txnId={layoutStore.formData.txnId}
        />
      </Show>
      <RenderModal isOpen={isRulesModalOpen()} toggle={toggleRulesModal}>
        <RulesModalBody />
      </RenderModal>
      <Show when={isImportModalOpen()}>
        <ImportModal toggleModal={toggleImportsModal} />
      </Show>
    </>
  );
}


