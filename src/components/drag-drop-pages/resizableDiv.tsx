import { createSignal } from "solid-js";

const ResizableContainer = (props) => {
    const [width, setWidth] = createSignal(500);
    const [height, setHeight] = createSignal(800);

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
        <div class={'w:full  h:full flex jc:center'}>
            <div class="resizable-container r:10|10|10|10"
                 style={`width: ${width()}px; height: ${height()}px; resize: both; border: 2px solid lightgray; overflow: auto; position: relative;scrollbar-width:thin;scrollbar-color:lightgrey;`}>
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
};

export default ResizableContainer;
