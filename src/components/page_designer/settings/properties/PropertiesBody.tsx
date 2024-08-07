import { createSignal, Show } from "solid-js";

import { setPropertyValueGlobal } from "~/components/page_designer/functions/setPropertyValueGlobal";
import { ZIndex } from "~/components/ZIndex";
import { getSelectionOptions } from "~/lib/graph/get/sync/getSelectionOptions";
import { useGraph, type Vertex } from "~/lib/graph/graph";

import { useDesignerLayoutStore } from "../../LayoutContext";
import { CollAndData } from "./CollAndData";
import { FormGroupProperties } from "./formgroup/FormGroupProperties";
import { ImportModal } from "./import/ImportModal";

export function PropertiesBody() {
  const [isImportModalOpen, setIsImportModalOpen] = createSignal(false);
  const [graph, setGraph] = useGraph();
  const [layoutStore] = useDesignerLayoutStore();

  const setPropertyValue = (meta: Vertex, value: any) => {
    if (layoutStore.selectedId !== -1 && layoutStore.selectedComponent !== -1) {
      return setPropertyValueGlobal(
        graph,
        setGraph,
        layoutStore.formStore[0].txnId,
        meta,
        graph.vertexes[layoutStore.selectedId],
        graph.vertexes[layoutStore.selectedComponent],
        value,
      );
    }
  };

  const selectedComponentProperties = () => {
    const selectedComp = graph.vertexes[layoutStore.selectedComponent];
    if (!selectedComp) {
      return { error: true };
    }
    return getSelectionOptions(graph, setGraph, "->$0Prop", [selectedComp]);
  };

  const toggleImportsModal = () => setIsImportModalOpen((prev) => !prev);

  return (
    <Show when={layoutStore.selectedId !== -1}>
      <div class="flex gap:2 jc:start">
        {/* <button onClick={toggleImportsModal}>Import HTML</button> */}
      </div>
      <CollAndData />
      <FormGroupProperties
        metaAttributes={selectedComponentProperties().vertexes ?? []}
        selectedLayout={graph.vertexes[layoutStore.selectedId]}
        setValue={setPropertyValue}
        txnId={layoutStore.formStore[0].txnId}
      />
      <ZIndex>
        <Show when={isImportModalOpen()}>
          <ImportModal toggleModal={toggleImportsModal} />
        </Show>
      </ZIndex>
    </Show>
  );
}
