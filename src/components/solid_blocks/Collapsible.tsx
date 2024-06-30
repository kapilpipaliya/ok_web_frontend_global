import {
  type Accessor,
  createContext,
  createSignal,
  createUniqueId, type JSX,
  type Setter,
} from "solid-js";
import { Icon } from "@iconify-icon/solid";

// Define the context type
export const collapsibleContext = createContext<
  null | [Accessor<string>, Setter<string>]
>(null);

// Parent component for the collapsible section
export function Collapsible(props: Readonly<{
  isOpen?: Accessor<boolean>;
  setOpen?: Setter<boolean>;
  title: any;
  children: JSX.Element;
  class?: string;
}>) {
  const [state, setState] = createSignal(props.isOpen ?? false);

  const toggleState = () => {
    const newState = !state();
    setState(newState);
  };


  return (
    <collapsibleContext.Provider value={createSignal(createUniqueId())}>
      <button
        type="button"
        class="collapsible"
        style={{
          "background-color": state() ? "rgb(125 125 125)" : "#777",
          color: "white",
          cursor: "pointer",
          padding: "18px",
          "border-radius": !state() ? "5px" : "5px 5px 0px 0px",
          width: "100%",
          border: "none",
          "text-align": "left",
          outline: "none",
          "font-size": "15px",
        }}
        onClick={toggleState}
      >
        {props.title}
        <Icon
          style={{
            "font-size": "13px",
            color: "white",
            float: "right",
            "margin-left": "5px",
          }}
          icon={state() ? "mdi:minus" : "mdi:plus"}
        />
      </button>
      <div
        class="content"
        style={{
          padding: "0 18px",
          display: state() ? "block" : "none",
          "border-radius": "0px 0px 5px 5px",
          overflow: "hidden",
          "background-color": "#f1f1f1",
        }}
      >
        {props.children}
      </div>
    </collapsibleContext.Provider>
  );
}