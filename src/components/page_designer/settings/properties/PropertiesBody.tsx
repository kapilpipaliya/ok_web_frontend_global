import { createSignal, Show, useContext } from "solid-js";
import { getChildVertexes } from "~/lib/graph/get/sync/traverse";
import { GraphContext, type Vertex } from "~/lib/graph/graph";
import { CollAndData } from "./CollAndData";
import { setPropertyValueGlobal } from "~/lib/drag_drop/setPropertyValueGlobal";
import { FormGroupProperties } from "./FormGroupProperties";
import { useDesignerLayoutStore } from "../../LayoutContext";
import { ImportModal } from "./import/ImportModal";
import { RulesModalBody } from "./rules/RulesModalBody";
import { RenderModal } from "./rules/RenderModal";

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
    return;
  };

  const selectedComponentProperties = () => {
    const selectedComp = graph.vertexes[layoutStore.selectedComponent];
    if (!selectedComp) return { error: true };
    return getChildVertexes(graph, ["$0Prop"], [selectedComp]);
  };

  const toggleRulesModal = () => setIsRulesModalOpen(prev => !prev);
  const toggleImportsModal = () => setIsImportModalOpen(prev => !prev);


  return (
    <>
      <Show when={layoutStore.selectedId !== -1}>
        <div class="flex jc:start gap:2">
          <button class="mb:5" onClick={toggleRulesModal}>Rules</button>
          <button onClick={toggleImportsModal}>Import HTML</button>
        </div>
        <CollAndData />
        <FormGroupProperties
          txnId={layoutStore.formData.txnId}
          metaAttributes={selectedComponentProperties().vertexes ?? []}
          setValue={setPropertyValue}
          selectedLayout={graph.vertexes[layoutStore.selectedId]}
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


