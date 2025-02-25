import { createEffect, createSignal, type JSX, Show } from "solid-js";

import {
  type PageLayoutObject,
  useDesignerFormIdContext,
  useDesignerLayoutStore,
} from "~/features/page_designer/context/LayoutContext";
import { handleDrop } from "~/features/page_designer/event_handler/handleDrop";
import { resetDragDropState } from "~/features/page_designer/event_handler/resetDragDropState";
import { type Id, useGraph, type Vertex } from "~/lib/graph/graph";
import { mergeVertexProperties } from "~/lib/graph/mutate/vertex";

import type { FormStoreObject } from "../form/context/FormContext";

import { ResizeOverlay } from "./ResizeOverlay";
import { useToast } from "./Toast";
import {STYLES} from "~/pages/settings/constants";

export const DIMENSIONS = {
  desktop: {
    height: "1200px",
    icon: "ph:desktop",
    id: "desktop",
    width: "1000px",
  },
  mobile: {
    height: "570px",
    icon: "ph:device-mobile",
    id: "mobile",
    width: "360px",
  },
  tablet: {
    height: "1026px",
    icon: "ph:device-tablet",
    id: "tablet",
    width: "768px",
  },
} as const;

export function ResizableContainer(
  props: Readonly<{
    children: JSX.Element;
    class?: string;
    view: Id;
  }>,
) {
  const [width, setWidth] = createSignal(props.width || "");
  const [graph, setGraph] = useGraph();
  const [height, setHeight] = createSignal(props.height || "");
  const [containerRef, setContainerRef] = createSignal<HTMLDivElement>();
  const [resizing, setResizing] = createSignal(false);
  const [isDraggingOver, setIsDraggingOver] = createSignal(false);
  const { showErrorToast } = useToast();

  const layoutStoreId = useDesignerLayoutStore();
  const layoutStoreVertex = () =>
    graph.vertexes[layoutStoreId] as Vertex<PageLayoutObject>;
  const formStoreId = useDesignerFormIdContext();
  const formStoreVertex = () =>
    graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;
  const viewVertex = () =>
    graph.vertexes[props.view] as Vertex<{
      height: string;
      view: string;
      width: string;
    }>;

  createEffect(() => {
    const view = viewVertex();
    if (view?.P.width && view?.P.height) {
      setWidth(view.P.width);
      setHeight(view.P.height);
    } else {
      const dimension =
        DIMENSIONS[view?.P.view?.toLowerCase() as keyof typeof DIMENSIONS] ||
        DIMENSIONS.desktop;
      setWidth(dimension.width);
      setHeight(dimension.height);
    }
  });

  const handlePointerDown = (
    e: PointerEvent,
    direction: "horizontal" | "vertical",
  ) => {
    e.preventDefault();
    const container = containerRef();
    if (!container) {
      return;
    }

    setResizing(true);
    const initialWidth = container.offsetWidth;
    const initialHeight = container.offsetHeight;
    const startX = e.clientX;
    const startY = e.clientY;

    const handlePointerMove = (e: PointerEvent) => {
      if (!resizing()) {
        return;
      }

      if (direction === "horizontal") {
        const newWidth = `${Math.max(50, initialWidth + e.clientX - startX)}px`;
        setWidth(newWidth);
        mergeVertexProperties(0, props.view, graph, setGraph, {
          width: newWidth,
        });
      } else if (direction === "vertical") {
        const newHeight = `${Math.max(50, initialHeight + e.clientY - startY)}px`;
        setHeight(newHeight);
        mergeVertexProperties(0, props.view, graph, setGraph, {
          height: newHeight,
        });
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
    e.preventDefault(); // Allow drop
    setIsDraggingOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  const handleDropEvent = async (e: DragEvent) => {
    setIsDraggingOver(false);
    mergeVertexProperties<PageLayoutObject>(
      0,
      layoutStoreId!,
      graph,
      setGraph,
      {
        activeItem: formStoreVertex()?.P.formDataId,
        position: "center",
      },
    );

    await handleDrop(
      e,
      layoutStoreVertex(),
      formStoreVertex(),
      graph,
      setGraph,
      showErrorToast,
    );
    resetDragDropState(layoutStoreVertex(), graph, setGraph);
  };

  return (
    <div class={`grid ${props.class} ${STYLES.overflow} flex-shrink:0`}>
      <div
        class={`${STYLES.overflow} justify-self:center position:relative r:10 flex flex:col`}
        classList={{
          "bg:primary-5": isDraggingOver(),
          "user-select:none": resizing(),
        }}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDropEvent}
        ref={setContainerRef}
        style={{
          height: height(),
          width: width(),
        }}
      >
        <div
          onPointerDown={(e) => handlePointerDown(e, "horizontal")}
          style={`width: 4px; height: ${height()}; background-color: lightgrey; cursor: col-resize; position: absolute; right: 0;`}
        />
        {props.children}
        <div
          onPointerDown={(e) => handlePointerDown(e, "vertical")}
          style={
            "width: 100%; height: 4px; background-color: lightgrey; cursor: row-resize; position: absolute; bottom: 0;"
          }
        />
      </div>

      <Show when={resizing()}>
        <ResizeOverlay />
      </Show>
    </div>
  );
}
