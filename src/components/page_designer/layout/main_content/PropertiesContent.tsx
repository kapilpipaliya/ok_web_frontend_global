import { Show } from "solid-js";

import { FormContext, type FormStoreObject } from "~/components/form/context/FormContext";
import { useGraph, type Vertex } from "~/lib/graph/graph";

import { DesignerFormIdContext, type PageLayoutObject, useDesignerLayoutStore } from "../../context/LayoutContext";
import { PropertiesWrapper } from "../../settings/properties/PropertiesWrapper";

export function PropertiesContent() {
  const [graph] = useGraph();
  const layoutStoreId = useDesignerLayoutStore();
  const layoutStore = () => (graph.vertexes[layoutStoreId]?.P as PageLayoutObject) || {};
  const formStoreVertex = () => graph.vertexes[layoutStore().formId!] as Vertex<FormStoreObject>;
  return (
    <Show keyed when={formStoreVertex()?.id}>
      <Show
        when={formStoreVertex()?.P &&
          graph.vertexes[formStoreVertex()?.P.selectedId] &&
          graph.vertexes[formStoreVertex()?.P.selectedId].L?.[0]?.endsWith("Attr")}
      >
        <DesignerFormIdContext.Provider value={formStoreVertex().id}>
          <FormContext.Provider value={formStoreVertex().id}>
            <PropertiesWrapper />
          </FormContext.Provider>
        </DesignerFormIdContext.Provider>
      </Show>
    </Show>
  );
}
