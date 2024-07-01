import { type JSX, createEffect, createSignal } from "solid-js";

export function ResizableContainer(props: Readonly<{
  children: JSX.Element;
  view: string;
}>) {
  const [width, setWidth] = createSignal("");
  const [height, setHeight] = createSignal("calc(100vh - 70px)");
  const DIMENSIONS = {
    desktop: { height: "1200px", width: "100%" },
    mobile: { height: "570px", width: "360px" },
    tablet: { height: "1026px", width: "768px" }
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

  return (
    <div class="grid overflow:auto"
      classList={{
        "jc:center": props.view !== "Desktop",
        "min-h:80%": props.view === "Mobile",
        "min-h:100%": props.view === "Tablet"
      }}>
      <div
        class="r:10|10|10|10 min-h:80% min-w:30% justify-self:center"
        style={`${width() ? `width:${width()};` : ""} height: ${height()}; max-height:80vh;border: 2px solid lightgray; overflow: auto; position: relative;scrollbar-width:thin;scrollbar-color:lightgrey;`}
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
