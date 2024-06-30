import { type JSX, Show, useContext, splitProps, createSignal, onMount } from "solid-js";
import { GraphContext } from "~/lib/graph/graph";
import { mergeVertexProperties } from "~/lib/graph/mutate/vertex";
import type { ComponentProps } from "../fields/ComponentType";
import { useDesignerLayoutStore } from "../page_designer/LayoutContext";

interface LabeledFieldProps {
  label?: string;
  position?: "top" | "left" | "right" | "bottom" | "system";
  children: JSX.Element;
}

export function Label(props: JSX.IntrinsicAttributes & JSX.LabelHTMLAttributes<HTMLLabelElement> & ComponentProps & LabeledFieldProps) {
  const [layoutStore] = useDesignerLayoutStore() || [];
  const [graph, setGraph] = useContext(GraphContext)!;
  const [isEditing, setIsEditing] = createSignal(false);
  const [inputValue, setInputValue] = createSignal(props.label ?? "");

  const getFlexDirection = () => {
    const position = props.position === "system" ? layoutStore?.labelPosition : props.position;
    switch (position) {
      case "top":
        return "column";
      case "bottom":
        return "column-reverse";
      case "left":
        return "row";
      case "right":
        return "row-reverse";
      default:
        return "column";
    }
  };

  const containerStyle = () => ({
    display: "flex",
    "flex-direction": getFlexDirection(),
    "align-items": props.position === "left" || props.position === "right" ? "center" : "flex-start",
    margin: "10px 0",
    padding: "0px 10px",
    width: "100%",
  }) as JSX.CSSProperties;

  const labelStyle = () => ({
    "margin-bottom": props.position === "top" ? "5px" : "0",
    "margin-top": props.position === "bottom" ? "5px" : "0",
    "margin-right": props.position === "left" ? "5px" : "0",
    "margin-left": props.position === "right" ? "5px" : "0",
  });

  const handleBlur = (e: FocusEvent) => {
    setIsEditing(false);
    if (layoutStore.formData?.txnId) {
      mergeVertexProperties(layoutStore.formData.txnId, props.meta.id, graph, setGraph, {label: (e.currentTarget as HTMLInputElement).value});
    }
  };

  const handleLabelClick = (e: MouseEvent) => {
    if (!layoutStore.formData?.txnId) return;
    setInputValue(props.label ?? "");
    setIsEditing(true);
  };

  const [local, restProps] = splitProps(props, ["label", "position", "children"]);
  return (
    <div style={containerStyle()}>
      <Show when={props.label}>
        <Show when={!isEditing()} fallback={
          <input
            type="text"
            ref={el => {
              onMount(() => {
                el.focus();
              })
            }}
            value={inputValue()}
            onInput={(e) => setInputValue(e.currentTarget.value)}
            onBlur={handleBlur}
            style={{border: "none", outline: "none", background: "transparent", width: "100%"}}
          />
        }>
          <label style={labelStyle()} {...restProps} onClick={handleLabelClick}>
            {props.label}
          </label>
        </Show>
      </Show>
      {props.children}
    </div>
  );
}
