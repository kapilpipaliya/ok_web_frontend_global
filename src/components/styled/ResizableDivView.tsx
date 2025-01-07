import { createEffect, createSignal, Show, type JSX } from "solid-js";
import { Portal } from "solid-js/web";

import { useGraph, Vertex } from "~/lib/graph/graph";
import { handleDrop } from "../page_designer/event_handler/handleDrop";
import { resetDragDropState } from "../page_designer/event_handler/resetDragDropState";
import { PageLayoutObject, useDesignerLayoutStore } from "../page_designer/context/LayoutContext";
import { useToast } from "./Toast";
import { FormStoreObject } from "../form/context/FormContext";
import { getGlobalStore } from "~/lib/graph/get/sync/getGlobalStore";
import { mergeVertexProperties } from "~/lib/graph/mutate/vertex";

export function ResizableContainer(
  props: Readonly<{
    children: JSX.Element;
    view: string;
    width?: string;
    height?: string;
  }>,
) {
  const [width, setWidth] = createSignal(props.width || "");
  const [graph, setGraph] = useGraph();
  const [height, setHeight] = createSignal(
    props.height || `calc(100vh - ${getGlobalStore(graph).P.navBarHeight + 2}px)`
  );
  const [containerRef, setContainerRef] = createSignal<HTMLDivElement>();
  const [resizing, setResizing] = createSignal(false);

  const DIMENSIONS = {
    desktop: { height: "1200px", width: "1200px" },
    mobile: { height: "570px", width: "360px" },
    tablet: { height: "1026px", width: "768px" },
  };

  createEffect(() => {
    if (!props.width && !props.height) {
      if (props.view === "Mobile") {
        setWidth(DIMENSIONS.mobile.width);
        setHeight(DIMENSIONS.mobile.height);
      } else if (props.view === "Tablet") {
        setWidth(DIMENSIONS.tablet.width);
        setHeight(DIMENSIONS.tablet.height);
      } else {
        setWidth(DIMENSIONS.desktop.width);
        setHeight(DIMENSIONS.desktop.height);
      }
    }
  });

  const handleMouseDown = (e: MouseEvent, direction: "horizontal" | "vertical") => {
    e.preventDefault();
    const container = containerRef();
    if (!container) return;

    setResizing(true);
    const initialWidth = container.offsetWidth;
    const initialHeight = container.offsetHeight;
    const startX = e.clientX;
    const startY = e.clientY;

    const handleMouseMove = (e: MouseEvent) => {
      if (!resizing()) return;
      
      if (direction === "horizontal") {
        const newWidth = initialWidth + e.clientX - startX;
        setWidth(`${Math.max(50, newWidth)}px`);
      } else if (direction === "vertical") {
        const newHeight = initialHeight + e.clientY - startY;
        setHeight(`${Math.max(50, newHeight)}px`);
      }
    };

    const handleMouseUp = () => {
      setResizing(false);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const [isDraggingOver, setIsDraggingOver] = createSignal(false);
  const layoutStoreId = useDesignerLayoutStore();
  const { showErrorToast } = useToast();

  const layoutStore = () => graph.vertexes[layoutStoreId].P as PageLayoutObject;
  const formStoreVertex = () => graph.vertexes[layoutStore().formId!] as Vertex<FormStoreObject>;

  return (
    <div
      class="scrollbar-color:lightgrey grid {scrollbar-width:thin} overflow:auto"
    >
      <div
        ref={setContainerRef}
        class="scrollbar-color:lightgrey {scrollbar-width:thin} justify-self:center overflow:auto position:relative r:10|10|10|10"
        classList={{
          "bg:#f3f3f4": isDraggingOver(),
          "user-select:none": resizing(),
        }}
        style={{
          height: height(),
          width: width()
        }}
        onDragOver={(e) => {
          e.preventDefault(); // Allow drop
          setIsDraggingOver(true);
        }}
        onDragLeave={() => {
          setIsDraggingOver(false)
        }}
        onDrop={async (e) => {
          setIsDraggingOver(false);
          mergeVertexProperties<PageLayoutObject>(0, layoutStoreId, graph, setGraph, {
            activeItem: formStoreVertex().P.formDataId,
            position: "center"
          });

          await handleDrop(
            e,
            layoutStoreId,
            graph,
            setGraph,
            showErrorToast
          );
          resetDragDropState(layoutStoreId, graph, setGraph);
        }}
      >
        <div
          style={`width: 4px; height: ${height()}; background-color: lightgrey; cursor: col-resize; position: absolute; right: 0;`}
          onMouseDown={(e) => handleMouseDown(e, "horizontal")}
        />
        {props.children}
        <div
          style={`width: 100%; height: 4px; background-color: lightgrey; cursor: row-resize; position: absolute; bottom: 0;`}
          onMouseDown={(e) => handleMouseDown(e, "vertical")}
        />
      </div>

      {/* Overlay Portal */}
      <Show when={resizing()}>
        <Portal>
          <div
            style={{
              position: 'fixed',
              top: '0',
              left: '0',
              right: '0', 
              bottom: '0',
              'z-index': '9999'
            }}
          />
        </Portal>
      </Show>
    </div>
  );
}
