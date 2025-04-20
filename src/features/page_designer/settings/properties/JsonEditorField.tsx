import { createEffect, createSignal, on } from "solid-js";

import type { FormStoreObject } from "~/components/form/context/FormContext";
import type { Vertex } from "~/lib/graph/graph";

import { VanilaJsonEditor } from "~/components/styled/VanilaJsonEditor";
import { useDesignerFormIdContext } from "~/features/page_designer/context/LayoutContext";
import { useGraph } from "~/lib/graph/GraphContext";
import { replaceVertexProperties } from "~/lib/graph/mutate/core/vertex";
import { css } from "~/lib/styles";
import { As } from "~/components/As";

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
    <As as="div" css={css`
  margin-top: 5px;
`}>
      JSON

      <VanilaJsonEditor
        json={graph.vertexes[formStoreVertex()?.P.selectedId]?.P ?? {}}
        onChange={replacePropertyValue}
      />
      {!isJsonValid() && <As as="span" css={css`
  color: \${args.theme.var.color.error};
`}>Invalid JSON</As>}
    </As>
  );
}
