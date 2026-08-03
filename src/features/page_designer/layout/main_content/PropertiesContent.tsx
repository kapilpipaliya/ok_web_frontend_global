import { Show } from "solid-js";

import {
  FormContext,
  type FormStoreObject,
} from "~/components/form/context/FormContext";
import { PropertiesBody } from "~/features/page_designer/settings/properties/PropertiesBody";

import {
  DesignerFormIdContext,
  type PageLayoutObject,
  useDesignerLayoutStore,
} from "../../context/LayoutContext";
import { getPropertiesAttrId } from "../../functions/layout/layoutHoverState";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { Id } from "~/lib/graph/type/id";
import { useGraph } from "~/lib/graph/context/UseGraph";

export function PropertiesContent(props: { openedFormId: Id }) {
  const [graph] = useGraph();
  const layoutStoreId = useDesignerLayoutStore();
  const layoutStore = () =>
    (graph.vertexes[layoutStoreId]?.P as PageLayoutObject) || {};
  const formStoreId = () => graph.vertexes[props.openedFormId]?.P?.formId as Id;
  const formStoreVertex = () =>
    graph.vertexes[formStoreId()] as Vertex<FormStoreObject>;
  return (
    <Show keyed when={formStoreVertex()?.id}>
      <Show
        when={
          formStoreVertex()?.P &&
          graph.vertexes[
            getPropertiesAttrId(formStoreVertex()?.P, layoutStore())
          ]
        }
      >
        <DesignerFormIdContext.Provider value={formStoreVertex().id}>
          <FormContext.Provider value={formStoreVertex().id}>
            <PropertiesBody openedFormId={props.openedFormId} />
          </FormContext.Provider>
        </DesignerFormIdContext.Provider>
      </Show>
    </Show>
  );
}
