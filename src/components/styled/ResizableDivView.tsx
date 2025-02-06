import { createEffect, createSignal, type JSX, Show } from "solid-js";

import { getGlobalStore } from "~/lib/graph/get/sync/getGlobalStore";
import { type Id, useGraph, type Vertex } from "~/lib/graph/graph";
import { mergeVertexProperties } from "~/lib/graph/mutate/vertex";

import type { FormStoreObject } from "../form/context/FormContext";

import { type PageLayoutObject, useDesignerFormIdContext, useDesignerLayoutStore } from "../page_designer/context/LayoutContext";
import { handleDrop } from "../page_designer/event_handler/handleDrop";
import { resetDragDropState } from "../page_designer/event_handler/resetDragDropState";
import { ResizeOverlay } from "./ResizeOverlay";
import { useToast } from "./Toast";

export const DIMENSIONS = {
  desktop: { height: "1200px", icon: "ph:desktop", id: "desktop", width: "1000px" },
  mobile: { height: "570px", icon: "ph:device-mobile", id: "mobile", width: "360px" },
  tablet: { height: "1026px", icon: "ph:device-tablet", id: "tablet", width: "768px" },
};

export function ResizableContainer(
  props: Readonly<{
    children: JSX.Element;
    class?: string;
    height?: string;
    view: Id;
    width?: string;
  }>,
) {
  const [width, setWidth] = createSignal(props.width || "");
  const [graph, setGraph] = useGraph();
  const [height, setHeight] = createSignal(
    props.height || `calc(100vh - ${getGlobalStore(graph).P.navBarHeight + 2}px)`
  );
  const [containerRef, setContainerRef] = createSignal<HTMLDivElement>();
  const [resizing, setResizing] = createSignal(false);
  const [isDraggingOver, setIsDraggingOver] = createSignal(false);
  const { showErrorToast } = useToast();

  const layoutStoreId = useDesignerLayoutStore();
  const layoutStoreVertex = () => graph.vertexes[layoutStoreId] as Vertex<PageLayoutObject>;
  const formStoreId = useDesignerFormIdContext();
  const formStoreVertex = () => graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;
  const viewVertex = () => graph.vertexes[props.view] as Vertex<{view: string}>;

  createEffect(() => {
    if (!props.width && !props.height) {
      const dimension = DIMENSIONS[viewVertex()?.P.view?.toLowerCase() as keyof typeof DIMENSIONS] || DIMENSIONS.desktop;
      setWidth(dimension.width);
      setHeight(dimension.height);
    }
  });

  const handlePointerDown = (e: PointerEvent, direction: "horizontal" | "vertical") => {
    e.preventDefault();
    const container = containerRef();
    if (!container) return;

    setResizing(true);
    const initialWidth = container.offsetWidth;
    const initialHeight = container.offsetHeight;
    const startX = e.clientX;
    const startY = e.clientY;

    const handlePointerMove = (e: PointerEvent) => {
      if (!resizing()) return;
      
      if (direction === "horizontal") {
        const newWidth = initialWidth + e.clientX - startX;
        setWidth(`${Math.max(50, newWidth)}px`);
      } else if (direction === "vertical") {
        const newHeight = initialHeight + e.clientY - startY;
        setHeight(`${Math.max(50, newHeight)}px`);
      }
    };

    const handlePointerUp = () => {
      setResizing(false);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();  // Allow drop
    setIsDraggingOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  const handleDropEvent = async (e: DragEvent) => {
    setIsDraggingOver(false);
    mergeVertexProperties<PageLayoutObject>(0, layoutStoreId!, graph, setGraph, {
      activeItem: formStoreVertex()?.P.formDataId,
      position: "center"
    });

    await handleDrop(e, layoutStoreVertex(), formStoreVertex(), graph, setGraph, showErrorToast);
    resetDragDropState(layoutStoreVertex(), graph, setGraph);
  };

  return (
    <div class={`scrollbar-color:lightgrey grid ${props.class} overflow:auto  {scrollbar-width:thin}  flex-shrink:0`}>
      <div
        class="scrollbar-color:lightgrey {scrollbar-width:thin} justify-self:center overflow:auto position:relative r:10|10|10|10 flex flex:col"
        classList={{
          "bg:#f3f3f4": isDraggingOver(),
          "user-select:none": resizing(),
        }}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDropEvent}
        ref={setContainerRef}
        style={{
          height: height(),
          width: width()
        }}
      >
        <div
          onPointerDown={(e) => handlePointerDown(e, "horizontal")}
          style={`width: 4px; height: ${height()}; background-color: lightgrey; cursor: col-resize; position: absolute; right: 0;`}
        />
        {props.children}
        <div
          onPointerDown={(e) => handlePointerDown(e, "vertical")}
          style={`width: 100%; height: 4px; background-color: lightgrey; cursor: row-resize; position: absolute; bottom: 0;`}
        />
      </div>

      <Show when={resizing()}>
        <ResizeOverlay />
      </Show>
    </div>
  );
}
