import { createSignal, type JSX, Show, onCleanup, onMount } from "solid-js";

function Drawer(props: {
  customButton?: (props: {
    onClick: () => void;
    isOpen: boolean;
  }) => JSX.Element;
  children: any;
  width?: string;
  open?: any;
  setIsOpen?: any;
}) {
  const [isOpen, setIsOpen] = props.open
    ? [props.open, props.setIsOpen]
    : createSignal(false);
  const [drawerWidth, setDrawerWidth] = createSignal(props.width || "450px");
  const [mainDivHover, setMainDivHover] = createSignal(false);

  const toggleDrawer = () => {
    setIsOpen(!isOpen());
  };


  let initialX: number;
  let initialWidth: number;

  const handleMouseDown = (event: MouseEvent) => {
    initialX = event.clientX;
    initialWidth = parseInt(drawerWidth(), 10);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (event: MouseEvent) => {
    const newWidth = initialWidth - (event.clientX - initialX);
    setDrawerWidth(`${newWidth}px`);
  };

  const handleMouseUp = () => {
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  return (
    <>
      <Show when={props.customButton}>
        {props.customButton && (
          <props.customButton onClick={toggleDrawer} isOpen={isOpen()} />
        )}
      </Show>
      <div
        id="drawer"
        style={`
          position: fixed;
          top: 0;
          right: ${isOpen() ? "0" : `-${drawerWidth()}`};
          width: ${drawerWidth()};
          height: 100%;
          color: black;
          background-color: white;
          box-shadow: 0 2px 5px rgba(0,0,0,0.5);
          border-radius: 15px 0px 0px 15px;
          z-index: 20;
          transition: right 0.5s;
          border-left: ${mainDivHover()?"2px solid #37c":"none"};
        `}
      >
        <div style="padding: 20px;scrollbar-width: thin;" class="overflow:auto  h:100%">{props.children}</div>
        <div
          onMouseEnter={() => setMainDivHover(true)}
          onMouseLeave={() => setMainDivHover(false)}
          style={`
            position: absolute;
            top: 0;
            left: -5px;
            width: 10px;
            height: 100%;
            cursor: ew-resize;
          `}
          onMouseDown={handleMouseDown}
        />
      </div>
      <div
        style={`
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 10;
          display: ${isOpen() ? "block" : "none"};
        `}
        onClick={toggleDrawer}
      />
    </>
  );
}

export default Drawer;
