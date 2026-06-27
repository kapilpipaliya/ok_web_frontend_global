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
  useDesignerLayoutStore,
} from "../context/LayoutContext";
import { LayoutTree } from "./layout/LayoutTree";
import type { Id } from "~/lib/graph/type/id";

export function LayoutTreePanel(props: { openedFormId: Id }) {
  const [graph] = useGraph();

  const formStoreId = () => graph.vertexes[props.openedFormId]?.P?.formId as Id;
  const formStoreVertex = () =>
    graph.vertexes[formStoreId()] as Vertex<FormStoreObject>;

  const isActiveFormFunction = () => {
    const label = graph.vertexes[props.openedFormId]?.P?.label as
      | string
      | undefined;
    return label === "Function";
  };

  return (
    <As as="div">
      <Show keyed when={!isActiveFormFunction() && formStoreVertex()?.id}>
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
