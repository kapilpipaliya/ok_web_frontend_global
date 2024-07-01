import { type Accessor, type JSX, type Setter, Show, createSignal, onCleanup, onMount } from "solid-js";

interface DrawerProps {
  children: JSX.Element;
  customButton?: (props: Readonly<{
    isOpen: boolean;
    onClick: () => void;
  }>) => JSX.Element;
  drawerStyle?: string;
  open?: Accessor<boolean>;
  setIsOpen?: Setter<boolean>;
  width?: string;
}

export function Drawer(props: Readonly<DrawerProps>) {
  const [isOpen, setIsOpen] = props.open && props.setIsOpen
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
    initialWidth = Number.parseInt(drawerWidth(), 10);
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

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape" && isOpen()) {
      toggleDrawer();
    }
  };

  onMount(() => {
    document.addEventListener("keydown", handleKeyDown);
  });

  onCleanup(() => {
    document.removeEventListener("keydown", handleKeyDown);
  });

  return (
    <>
      <Show when={props.customButton}>
        {props.customButton && (
          <props.customButton isOpen={isOpen()} onClick={toggleDrawer} />
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
        <div class="h:100%  overflow:auto" style={`padding: 20px;scrollbar-width: thin; ${props.drawerStyle}`}>{props.children}</div>
        <div
          onMouseDown={handleMouseDown}
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
        />
      </div>
      <div
        onClick={toggleDrawer}
        style={`
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 10;
          display: ${isOpen() ? "block" : "none"};
        `}
      />
    </>
  );
}
