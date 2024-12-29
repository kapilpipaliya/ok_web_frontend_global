import { createEffect, createSignal, type JSX } from "solid-js";

import { useGraph } from "~/lib/graph/graph";
import { handleDrop } from "../page_designer/event_handler/handleDrop";
import { resetDragDropState } from "../page_designer/event_handler/resetDragDropState";
import { useDesignerLayoutStore } from "../page_designer/context/LayoutContext";
import { useToast } from "./Toast";

export function ResizableContainer(
  props: Readonly<{
    children: JSX.Element;
    view: string;
  }>,
) {
  const [width, setWidth] = createSignal("");
  const [graph, setGraph] = useGraph();
  const [_height, setHeight] = createSignal(
    `calc(100vh - ${graph.navBarHeight + 2}px)`,
  );
  const DIMENSIONS = {
    desktop: { height: "1200px", width: "100%" },
    mobile: { height: "570px", width: "360px" },
    tablet: { height: "1026px", width: "768px" },
  };

  createEffect(() => {
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
  });

  // const handleMouseDown = (e, direction) => {
  //     e.preventDefault();
  //     const container = e.target.closest(".resizable-container");
  //     const initialWidth = container.offsetWidth;
  //     const initialHeight = container.offsetHeight;
  //     const startX = e.clientX;
  //     const startY = e.clientY;
  //
  //     const handleMouseMove = (e) => {
  //         if (direction === "horizontal") {
  //             const newWidth = initialWidth + e.clientX - startX;
  //             setWidth(newWidth < 50 ? 50 : newWidth);
  //         } else if (direction === "vertical") {
  //             const newHeight = initialHeight + e.clientY - startY;
  //             setHeight(newHeight < 50 ? 50 : newHeight);
  //         }
  //     };
  //
  //     const handleMouseUp = () => {
  //         window.removeEventListener("mousemove", handleMouseMove);
  //         window.removeEventListener("mouseup", handleMouseUp);
  //     };
  //
  //     window.addEventListener("mousemove", handleMouseMove);
  //     window.addEventListener("mouseup", handleMouseUp);
  // };

  const [isDraggingOver, setIsDraggingOver] = createSignal(false);
  const [layoutStore, setLayoutStore] = useDesignerLayoutStore();
  const { showErrorToast } = useToast();
  return (
    <div
      class="scrollbar-color:lightgrey grid {scrollbar-width:thin} overflow:auto width:100%"
    >
      <div
        class="scrollbar-color:lightgrey {scrollbar-width:thin} border:2px|solid|lightgray justify-self:center overflow:auto position:relative r:10|10|10|10"
        classList={{
          [`height:calc(100vh-${graph.navBarHeight + 2}px)`]: true,
          // [`height:${height()}`]: !!height(), // resizable height
          [`width:${width()}`]: !!width(),
          "bg:#f3f3f4": isDraggingOver(),
        }}
        onDragOver={(e) => {
          e.preventDefault(); // Allow drop
          setIsDraggingOver(true);
          console.log("Drag over event");
        }}
        onDragLeave={() => {
          setIsDraggingOver(false)
        }}
        onDrop={async (e) => {
          setIsDraggingOver(false);
          setLayoutStore("activeItem", layoutStore.formStore[0].formDataId);
          setLayoutStore("position", "center");

          await handleDrop(
            e,
            layoutStore,
            setLayoutStore,
            graph,
            setGraph,
            showErrorToast,
          );
          resetDragDropState(setLayoutStore);;
        }}
      >
        {/*<div
                    style={`width: 2px; height: ${height()}px; z-index:1; background-color: lightgrey; cursor: col-resize; position: absolute; right: 0;`}
                    onMouseDown={(e) => handleMouseDown(e, "horizontal")}
                />*/}
        {props.children}
        {/*<div
                    style={`width: 100%; height: 2px; background-color: lightgrey; cursor: row-resize; position: absolute; bottom: 0;`}
                    onMouseDown={(e) => handleMouseDown(e, "vertical")}
                />*/}
      </div>
    </div>
  );
}
