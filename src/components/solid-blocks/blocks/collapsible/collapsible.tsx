import {
  Accessor,
  createContext,
  createSignal,
  createUniqueId,
  Setter,
} from "solid-js";
import { Icon } from "@iconify-icon/solid";

// Define the context type
export const collapsibleContext = createContext<
  null | [Accessor<string>, Setter<string>]
>(null);

// Parent component for the collapsible section
export const Collapsible = (props: {
  isOpen: boolean;
  handleToggle: () => void;
  title: any;
  children: any;
}) => {
  return (
    // Provide the unique ID value to the collapsible context
    <collapsibleContext.Provider value={createSignal(createUniqueId())}>
      <button
        type="button"
        class="collapsible"
        style={{
          "background-color": props.isOpen ? "rgb(125 125 125)" : "#777",
          color: "white",
          cursor: "pointer",
          padding: "18px",
          "border-radius": !props.isOpen ? "5px" : "5px 5px 0px 0px",
          width: "100%",
          border: "none",
          "text-align": "left",
          outline: "none",
          "font-size": "15px",
        }}
        onClick={props.handleToggle}
      >
        {props.title}
        <Icon
          style={{
            "font-size": "13px",
            color: "white",
            float: "right",
            "margin-left": "5px",
          }}
          icon={props.isOpen ? "mdi:minus" : "mdi:plus"}
        />
      </button>
      <div
        class="content"
        style={{
          padding: "0 18px",
          display: props.isOpen ? "block" : "none",
          "border-radius": "0px 0px 5px 5px",
          overflow: "hidden",
          "background-color": "#f1f1f1",
        }}
      >
        {props.children}
      </div>
    </collapsibleContext.Provider>
  );
};
