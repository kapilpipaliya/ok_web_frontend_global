import { Show } from "solid-js";

import {
  FormContext,
  type FormStoreObject,
} from "~/components/form/context/FormContext";
import { As } from "~/components/As";
import type { Vertex } from "~/lib/graph/type/vertex";
import { useGraph } from "~/lib/graph/context/UseGraph";

import {
  DesignerFormIdContext,
  type PageLayoutObject,
  useDesignerLayoutStore,
} from "../context/LayoutContext";
import { LayoutTree } from "./layout/LayoutTree";

export function LayoutTreePanel() {
  const layoutStoreId = useDesignerLayoutStore();
  const [graph] = useGraph();

  const layoutStore = () =>
    (graph.vertexes[layoutStoreId].P as PageLayoutObject) ?? {};

  const formStoreVertex = () =>
    graph.vertexes[layoutStore().formId!] as Vertex<FormStoreObject>;

  const isActiveFormFunction = () => {
    const formId = layoutStore().formId;
    if (!formId) return false;
    const openFormId = layoutStore().openedFormIds?.find(
      (id) => graph.vertexes[id]?.P?.formId === formId,
    );
    const label = openFormId
      ? (graph.vertexes[openFormId]?.P?.label as string)
      : graph.vertexes[formStoreVertex()?.P?.formDataId]?.L?.[0];
    return label === "Function";
  };

  return (
    <As as="div">
      <Show
        keyed
        when={!isActiveFormFunction() && formStoreVertex()?.id}
      >
        {(formStoreId) => (
          <DesignerFormIdContext.Provider value={formStoreId}>
            <FormContext.Provider value={formStoreId}>
              <LayoutTree />
            </FormContext.Provider>
          </DesignerFormIdContext.Provider>
        )}
      </Show>
    </As>
  );
}
