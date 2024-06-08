import { type Accessor, type JSX, createEffect, createSignal } from "solid-js";

const ResizableContainer = (props: {
  view: Accessor<string>;
  children: JSX.Element;
}) => {
  const [width, setWidth] = createSignal("");
  const [height, setHeight] = createSignal("calc(100vh - 70px)");

  createEffect(() => {
    if (props.view() === "Mobile") {
      setWidth("400px");
      setHeight("570px");
    } else if (props.view() === "Tablet") {
      setWidth("30vw");
      setHeight("1026px");
    } else {
      setWidth("55vw");
      setHeight("889px");
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
    <div
      class="r:10|10|10|10 min-h:80% min-w:30% justify-self:center"
      style={`width: ${width()}; height: ${height()};max-height:80vh;border: 2px solid lightgray; overflow: auto; position: relative;scrollbar-width:thin;scrollbar-color:lightgrey;`}
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
  );
};

export default ResizableContainer;
