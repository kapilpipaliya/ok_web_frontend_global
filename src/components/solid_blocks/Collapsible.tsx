import { Icon } from "@iconify-icon/solid";
import {
  type Accessor,
  type JSX,
  type Setter,
  createContext, createSignal,
  createUniqueId,
} from "solid-js";

// Define the context type
export const collapsibleContext = createContext<
  [Accessor<string>, Setter<string>] | null
>(null);

// Parent component for the collapsible section
export function Collapsible(props: Readonly<{
  children: JSX.Element;
  class?: string;
  isOpen?: Accessor<boolean>;
  setOpen?: Setter<boolean>;
  title: any;
}>) {
  const [state, setState] = createSignal(props.isOpen ?? false);

  const toggleState = () => {
    const newState = !state();
    setState(newState);
  };


  return (
    <collapsibleContext.Provider value={createSignal(createUniqueId())}>
      <button
        class="collapsible"
        onClick={toggleState}
        style={{
          "background-color": state() ? "rgb(125 125 125)" : "#777",
          border: "none",
          "border-radius": !state() ? "5px" : "5px 5px 0px 0px",
          color: "white",
          cursor: "pointer",
          "font-size": "15px",
          outline: "none",
          padding: "18px",
          "text-align": "left",
          width: "100%",
        }}
        type="button"
      >
        {props.title}
        <Icon
          icon={state() ? "mdi:minus" : "mdi:plus"}
          style={{
            color: "white",
            float: "right",
            "font-size": "13px",
            "margin-left": "5px",
          }}
        />
      </button>
      <div
        class="content"
        style={{
          "background-color": "#f1f1f1",
          "border-radius": "0px 0px 5px 5px",
          display: state() ? "block" : "none",
          overflow: "hidden",
          padding: "0 18px",
        }}
      >
        {props.children}
      </div>
    </collapsibleContext.Provider>
  );
}