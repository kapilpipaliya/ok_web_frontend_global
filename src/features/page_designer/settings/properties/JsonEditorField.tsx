import { createEffect, createSignal, on, Show } from "solid-js";

import type { FormStoreObject } from "~/components/form/context/FormContext";

import { VanilaJsonEditor } from "~/components/styled/VanilaJsonEditor";
import { createAxisResizeHandler } from "~/lib/resizable/createAxisResizeHandler";
import { DesignerResizeHandle } from "~/lib/resizable/DesignerResizeHandle";
import { useResizeOverlay } from "~/lib/resizable/ResizeOverlayContext";
import { useDesignerResizeTrackSize } from "~/lib/resizable/useDesignerResizeTrackSize";
import {
  type PageLayoutObject,
  useDesignerFormIdContext,
  useDesignerLayoutStore,
} from "~/features/page_designer/context/LayoutContext";
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
  const layoutStoreId = useDesignerLayoutStore();
  const isResizingDisabled = () =>
    !!(graph.vertexes[layoutStoreId]?.P as PageLayoutObject | undefined)
      ?.isResizingDisabled;
  const formStoreVertex = () =>
    graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;
  const [isJsonValid, setIsJsonValid] = createSignal(true);
  const [manualHeight, setManualHeight] = createSignal<string | undefined>(
    props.height,
  );
  const [activeResize, setActiveResize] = createSignal(false);
  const { setResizing } = useResizeOverlay();
  const resizeTrackSize = useDesignerResizeTrackSize();
  const trackPx = () => `${resizeTrackSize()}px`;

  const editorHeight = () => manualHeight() ?? "200px";
  const parseHeight = () =>
    Number.parseFloat(editorHeight().replace("px", "")) || 100;

  const handleHeightResize = createAxisResizeHandler({
    axis: "y",
    getStartSize: parseHeight,
    growOnDragPositive: true,
    minSize: 100,
    onEnd: () => {
      setActiveResize(false);
      setResizing(false);
    },
    onResize: (size) => setManualHeight(`${size}px`),
    onStart: () => {
      setActiveResize(true);
      setResizing(true);
    },
  });

  // Get vertex to edit - either specified by props or use selected vertex
  const getVertexToEdit = () => {
    if (props?.vertexId) {
      return graph.vertexes[props.vertexId];
    }
    return formStoreVertex()?.P.selectedId === -1
      ? undefined
      : graph.vertexes[formStoreVertex()?.P.selectedId];
  };

  const replacePropertyValue = (value: string) => {
    const vertex = getVertexToEdit();
    if (!vertex) {
      return;
    }

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
      css={`return \`._id {
        margin-top: 5px;
      }\`;`}
    >
      {!props?.hideLabel && "JSON"}
      <As
        as="div"
        css={
          isResizingDisabled()
            ? `return \`._id {
          display: block;
          min-height: 0;
        }\`;`
            : `return \`._id {
          display: grid;
          grid-template-rows: 1fr ${trackPx()};
          min-height: 0;
        }\`;`
        }
        style={{
          height:
            !isResizingDisabled() && manualHeight()
              ? `calc(${editorHeight()} + ${trackPx()})`
              : manualHeight() || undefined,
        }}
      >
        <As
          as="div"
          css={`return \`._id {
            position: relative;
            z-index: 1;
            min-height: 0;
          }\`;`}
        >
          <VanilaJsonEditor
            json={getVertexToEdit()?.P ?? {}}
            onChange={replacePropertyValue}
            height={manualHeight()}
            autoHeight={!manualHeight()}
            minHeight={100}
            maxHeight={800}
          />
        </As>
        <Show when={!isResizingDisabled()}>
          <DesignerResizeHandle
            active={activeResize()}
            axis="y"
            onPointerDown={handleHeightResize}
          />
        </Show>
      </As>
      {!isJsonValid() && (
        <As
          as="span"
          css={`return \`._id {
  color: \${t.var.color.error};
}\`;`}
        >
          Invalid JSON
        </As>
      )}
    </As>
  );
}
