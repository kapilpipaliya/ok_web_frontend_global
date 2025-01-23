import { createEffect, createSignal, For, Show, type JSX } from "solid-js";

import { useGraph, Vertex } from "~/lib/graph/graph";
import { handleDrop } from "../page_designer/event_handler/handleDrop";
import { resetDragDropState } from "../page_designer/event_handler/resetDragDropState";
import { PageLayoutObject, useDesignerFormIdContext, useDesignerLayoutStore } from "../page_designer/context/LayoutContext";
import { useToast } from "./Toast";
import { FormStoreObject } from "../form/context/FormContext";
import { getGlobalStore } from "~/lib/graph/get/sync/getGlobalStore";
import { mergeVertexProperties } from "~/lib/graph/mutate/vertex";
import { ResizeOverlay } from "./ResizeOverlay";
import { IconButton } from "./IconButton";

export const DIMENSIONS = {
  mobile: { id: "mobile", height: "570px", width: "360px", icon: "prime:mobile" },
  tablet: { id: "tablet", height: "1026px", width: "768px", icon: "uil:tablet" },
  desktop: { id: "desktop", height: "1200px", width: "1200px", icon: "humbleicons:desktop" },
};

export function ResizableContainer(
  props: Readonly<{
    children: JSX.Element;
    view: string;
    width?: string;
    height?: string;
    class?: string;
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

  createEffect(() => {
    if (!props.width && !props.height) {
      const dimension = DIMENSIONS[props.view.toLowerCase() as keyof typeof DIMENSIONS] || DIMENSIONS.desktop;
      setWidth(dimension.width);
      setHeight(dimension.height);
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
    <div class={`scrollbar-color:lightgrey grid ${props.class} {scrollbar-width:thin} overflow:auto flex-shrink:0`}>
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
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDropEvent}
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

      <Show when={resizing()}>
        <ResizeOverlay />
      </Show>
    </div>
  );
}
