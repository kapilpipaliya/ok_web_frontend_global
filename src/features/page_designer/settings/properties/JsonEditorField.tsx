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
  const [editorHeight, setEditorHeight] = createSignal(props.height ?? "200px"); // Default height

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

  let editorRef: HTMLDivElement | undefined;

  const onMouseDown = (e: MouseEvent) => {
    e.preventDefault();
    const startY = e.clientY;
    const startHeight = editorRef?.offsetHeight ?? 0;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const newHeight = startHeight + (moveEvent.clientY - startY);
      setEditorHeight(`${Math.max(100, newHeight)}px`); // Minimum height 100px
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  return (
    <As
      as="div"
      css={css`
  margin-top: 5px;
  position: relative; /* Needed for absolute positioning of resize handle */
`}
      ref={editorRef}
    >
      {!props?.hideLabel && "JSON"}
      <VanilaJsonEditor
        json={getVertexToEdit()?.P ?? {}}
        onChange={replacePropertyValue}
        height={editorHeight()}
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
      <As
        as="div"
        onMouseDown={onMouseDown}
        css={css`
          width: 100%;
          height: 10px;
          cursor: ns-resize;
          background-color: \${args.theme.var.color.border};
          position: absolute;
          bottom: 0;
          left: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          user-select: none; /* Prevent text selection during drag */
          &::after {
            content: "";
            width: 30px;
            height: 2px;
            background-color: \${args.theme.var.color.textWeak};
            border-radius: 1px;
          }
        `}
      />
    </As>
  );
}
