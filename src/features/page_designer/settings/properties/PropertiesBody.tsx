import { Show } from "solid-js";

import type { FormStoreObject } from "~/components/form/context/FormContext";

import { setPropertyValueGlobal } from "~/features/page_designer/functions/setPropertyValueGlobal";
import { FunctionEditor } from "~/features/page_designer/settings/properties/FunctionEditor";
import { JsonEditorFieldComponent } from "~/features/page_designer/settings/properties/JsonEditorField";
import { evalExpression } from "~/lib/expression_eval";
import { useGraph, type Vertex } from "~/lib/graph/graph";
import { setSelectionValue } from "~/lib/graph/mutate/setSelectionValue";

import { useDesignerFormIdContext } from "../../context/LayoutContext";
import { CollAndData } from "./CollAndData";
import { ComponentVariantsInput } from "./ComponentVariantsInput";
import { FormGroupProperties } from "./formgroup/FormGroupProperties";

export function PropertiesBody() {
  const [graph, setGraph] = useGraph();

  const formStoreId = useDesignerFormIdContext();
  const formStoreVertex = () =>
    graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;
  const selectedAttr = () => graph.vertexes[formStoreVertex()?.P.selectedId];
  const selectedComp = () =>
    evalExpression("->$0Comp", {
      graph,
      setGraph,
      vertexes: [selectedAttr()],
    })?.[0];
  const clearFileSelection = (meta: Vertex) => {
    const txnId = formStoreVertex()?.P.txnId;
    if (!txnId) {
      return;
    }

    setSelectionValue(
      txnId,
      graph.vertexes[formStoreVertex()?.P.selectedId],
      graph,
      setGraph,
      meta,
    );
  };

  const setPropertyValue = (meta: Vertex, value: any) => {
    if (formStoreVertex()?.P.selectedId !== -1) {
      setPropertyValueGlobal(
        graph,
        setGraph,
        formStoreVertex()?.P.txnId,
        meta,
        graph.vertexes[formStoreVertex()?.P.selectedId],
        value,
      );
      if (value === null) {
        clearFileSelection(meta);
      }
    }
  };

  const selectedComponentProperties = () => {
    const compVertex = selectedComp();
    if (!compVertex) {
      return [];
    }
    return evalExpression("->$0Prop", {
      graph,
      setGraph,
      vertexes: [compVertex],
    });
  };

  return (
    <Show
      when={
        formStoreVertex()?.P.selectedId !== -1 &&
        graph.vertexes[formStoreVertex()?.P.selectedId]
      }
    >
      {/* <div class="flex gap:2 jc:start"> */}
      {/* <button onClick={toggleImportsModal}>Import HTML</button> */}
      {/* </div> */}
      <Show when={selectedAttr()?.P.componentName === "Repeater"}>
        <CollAndData />
      </Show>
      <JsonEditorFieldComponent />
      <FunctionEditor setPropertyValue={setPropertyValue} />
      <Show when={selectedAttr()?.P.componentName === "Component"}>
        <ComponentVariantsInput
          compVertex={selectedComp()}
          dataVertex={graph.vertexes[formStoreVertex()?.P.selectedId]}
          setPropertyValue={setPropertyValue}
        />
      </Show>
      <FormGroupProperties
        metaAttributes={selectedComponentProperties() ?? []}
        onChange={setPropertyValue}
        selectedLayout={graph.vertexes[formStoreVertex()?.P.selectedId]}
        txnId={formStoreVertex()?.P.txnId}
      />
    </Show>
  );
}
