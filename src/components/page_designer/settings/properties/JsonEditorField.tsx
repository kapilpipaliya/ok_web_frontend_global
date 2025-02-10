import { createEffect, createSignal, on } from "solid-js";

import type { FormStoreObject } from "~/components/form/context/FormContext";

import { JsonEditorField } from "~/components/fields/JsonEditorField";
import { useDesignerFormIdContext } from "~/components/page_designer/context/LayoutContext";
import { useGraph, type Vertex } from "~/lib/graph/graph";
import { replaceVertexProperties } from "~/lib/graph/mutate/vertex";

export function JsonEditorFieldComponent() {
  const [graph, setGraph] = useGraph();
  const formStoreId = useDesignerFormIdContext();
  const formStoreVertex = () =>
    graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;
  const [isJsonValid, setIsJsonValid] = createSignal(true);

  const replacePropertyValue = (value: any) => {
    if (formStoreVertex()?.P.selectedId !== -1) {
      try {
        const parsedValue = JSON.parse(value);
        replaceVertexProperties(
          formStoreVertex()?.P.txnId,
          graph.vertexes[formStoreVertex()?.P.selectedId].id,
          graph,
          setGraph,
          parsedValue,
        );
        setIsJsonValid(true);
      } catch (error) {
        console.error("Error parsing value:", error);
        setIsJsonValid(false);
      }
    }
  };
  createEffect(
    on(
      () => formStoreVertex()?.P.selectedId,
      () => {
        if (formStoreVertex()?.P.selectedId !== -1) {
          setIsJsonValid(true);
        }
      },
      { defer: true },
    ),
  );

  return (
    <label class="mt:5">
      Properties JSON
      {/* <textarea
          placeholder="Enter value here"
          value={JSON.stringify(graph.vertexes[formStoreVertex()?.P.selectedId].P, null, 2)}
          onChange={(e) => replacePropertyValue(e.currentTarget.value)}
          class={`${PROPERTIES.Css.TextField} ${!isJsonValid() ? 'b:red-50' : ''}`}
          style={{ height: "200px" }}
        /> */}
      <JsonEditorField
        json={graph.vertexes[formStoreVertex()?.P.selectedId].P}
        onChange={replacePropertyValue}
      />
      {!isJsonValid() && <span class="fg:red-50">Invalid JSON</span>}
    </label>
  );
}
