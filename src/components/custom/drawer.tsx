import { createSignal, type JSX, Show, onCleanup, onMount } from "solid-js";

function Drawer(props: {
  customButton?: (props: {
    onClick: () => void;
    isOpen: boolean;
  }) => JSX.Element;
  width: string;
  children: any;
  open?: any;
  setIsOpen?: any;
}) {
  const [isOpen, setIsOpen] = props.open
    ? [props.open, props.setIsOpen]
    : createSignal(false);
  const toggleDrawer = () => {
    setIsOpen(!isOpen());
  };
  const handleClickOutside = (event: MouseEvent) => {
    const drawerElement = document.getElementById("drawer");
    if (drawerElement && !drawerElement.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  onMount(() => {
    document.addEventListener("mousedown", handleClickOutside);
  });

  onCleanup(() => {
    document.removeEventListener("mousedown", handleClickOutside);
  });
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
          right: ${isOpen() ? "0" : `-${props.width || "350px"}`};
          width: ${props.width || "350px"};
          height: 100%;
          color: black;
          background-color: white;
          box-shadow: 0 2px 5px rgba(0,0,0,0.5);
          border-radius: 15px 0px 0px 15px;
          z-index: 20;
          transition: right 0.5s;
        `}
      >
        <div style="padding: 20px;">{props.children}</div>
      </div>
    </>
  );
}

export default Drawer;
