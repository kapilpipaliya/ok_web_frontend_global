import { makeEventListener } from "@solid-primitives/event-listener";
import { type Accessor, type JSX, type Setter, Show, createSignal } from "solid-js";

import { useGraph } from "~/lib/graph/graph";

import { useActiveClickOutside } from "./useActiveClickOutside";

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
  const [graph, setGraph] = useGraph();
  const activeClickOutside = useActiveClickOutside(graph, setGraph);
  const [isOpen, setIsOpen] = props.open && props.setIsOpen
    ? [props.open, props.setIsOpen]
    : createSignal(false);
  const [drawerWidth, setDrawerWidth] = createSignal(props.width || "450px");
  const [mainDivHover, setMainDivHover] = createSignal(false);
  const [floating, setFloating] = createSignal<HTMLElement | null>(null);

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

  const handleEscClose = (event: KeyboardEvent) => {
    if (event.key === "Escape" && isOpen()) {
      toggleDrawer();
    }
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (activeClickOutside !== graph.activeClickOutside) return;
    const path = event.composedPath();
    if (!path.includes(floating()!)) {
      setIsOpen(false);
    }
  };

  makeEventListener(document, "keydown", handleEscClose);
  makeEventListener(window, "mousedown", handleClickOutside);

  return (
    <>
      <Show when={props.customButton}>
        {/* @ts-expect-error ignore */}
        <props.customButton isOpen={isOpen()} onClick={toggleDrawer} />
      </Show>
      <div
        class={`${isOpen() ? "right:0" : `right:-${drawerWidth()}`} ${mainDivHover() ? "bl:2px|solid|#37c" : "bl:none"} bg:white border-radius:15px|0|0|15px box-shadow:0|2px|5px|rgba(0,0,0,0.5) color:black h:100% position:fixed top:0 transition:right|0.5s w:${drawerWidth()} z:20`}
        id="drawer"
        ref={setFloating}
      >
        <div class={`scrollbar-width:thin ${props.drawerStyle} h:100% overflow:auto p:20px`}>{props.children}</div>
        <div
          class="cursor:ew-resize h:100% left:-5px position:absolute top:0 w:10px"
          onMouseDown={handleMouseDown}
          onMouseEnter={() => setMainDivHover(true)}
          onMouseLeave={() => setMainDivHover(false)}
        />
      </div>
      {/* <div
        class={`${isOpen() ? "block" : "none"} h:100% left:0 position:fixed top:0 w:100%`}
        onClick={toggleDrawer}
      /> */}
    </>
  );
}
