import { createEffect, createSignal, on } from "solid-js";

import type { FormStoreObject } from "~/components/form/context/FormContext";

import { VanilaJsonEditor } from "~/components/styled/VanilaJsonEditor";
import { useDesignerFormIdContext } from "~/features/page_designer/context/LayoutContext";
import { css } from "~/lib/styles";
import { As } from "~/components/As";
import type { Vertex } from "~/lib/graph/type/vertex";
import { useGraph } from "~/lib/graph/context/UseGraph";

export function JsonEditorFieldComponent(props: {
  vertexId?: string;
  hideLabel?: boolean;
  height?: string;
  replaceProperties: (properties: { [key: string]: unknown }) => void;
}) {
  const [graph] = useGraph();
  const formStoreId = useDesignerFormIdContext();
  const formStoreVertex = () =>
    graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;
  const [isJsonValid, setIsJsonValid] = createSignal(true);

  // Get vertex to edit - either specified by props or use selected vertex
  const getVertexToEdit = () => {
    if (props?.vertexId) {
      return graph.vertexes[props.vertexId];
    }
    return formStoreVertex()?.P.selectedId !== -1
      ? graph.vertexes[formStoreVertex()?.P.selectedId]
      : undefined;
  };

  const replacePropertyValue = (value: string) => {
    const vertex = getVertexToEdit();
    if (!vertex) return;

    try {
      const parsedValue = JSON.parse(value);
      props.replaceProperties(parsedValue);
      setIsJsonValid(true);
    } catch (error) {
      console.error("Error parsing value:", error);
      setIsJsonValid(false);
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
    <As
      as="div"
      css={css`
  margin-top: 5px;
`}
    >
      {!props?.hideLabel && "JSON"}
      <VanilaJsonEditor
        json={getVertexToEdit()?.P ?? {}}
        onChange={replacePropertyValue}
        height={props.height}
      />
      {!isJsonValid() && (
        <As
          as="span"
          css={css`
  color: \${args.theme.var.color.error};
`}
        >
          Invalid JSON
        </As>
      )}
    </As>
  );
}
