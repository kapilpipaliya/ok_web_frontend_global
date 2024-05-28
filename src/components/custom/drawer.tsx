import { createSignal, JSX, Show } from "solid-js";

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
  const [isOpen, setIsOpen] = props.open ? [props.open, props.setIsOpen] : createSignal(false)
  const toggleDrawer = () => {
    setIsOpen(!isOpen());
  };

  return (
    <>
<Show when={props.customButton}>
        <props.customButton onClick={toggleDrawer} isOpen={isOpen()} />

</Show>
      <div style={{ display: isOpen() ? "block" : "none" }}>
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            opacity: isOpen() ? 1 : 0,
            transition: "opacity 0.5s",
          }}
          onClick={toggleDrawer}
        />
        <div
          style={{
            position: "fixed",
            top: 0,
            right: isOpen() ? 0 : `-${props.width}`,
            width: props.width || "350px",
            height: "100%",
            color: "black",
            "background-color": "white",
            "box-shadow": "0 2px 5px rgba(0,0,0,0.5)",
            "border-radius": "15px 0px 0px 15px",
            "z-index": 20,
            transition: "right 0.5s",
          }}
        >
          <div style={{ padding: "20px" }}>
            {props.children}
          </div>
        </div>
      </div>
    </>
  );
}

export default Drawer;
