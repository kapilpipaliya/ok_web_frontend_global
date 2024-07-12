import {
  type JSX,
  Show,
  createMemo,
  createSignal,
  onMount,
  splitProps,
} from "solid-js";

import { useFormContext } from "~/lib/contexts";
import { useGraph } from "~/lib/graph/graph";
import { mergeVertexProperties } from "~/lib/graph/mutate/vertex";

import type { ComponentProps } from "../fields/ComponentType";

import { useDesignerLayoutStore } from "../page_designer/LayoutContext";

interface LabeledFieldProps {
  children: JSX.Element;
  label?: string;
  position?: "bottom" | "left" | "right" | "system" | "top";
}

export function Label(
  props: ComponentProps &
    JSX.IntrinsicAttributes &
    JSX.LabelHTMLAttributes<HTMLLabelElement> &
    LabeledFieldProps,
) {
  const [layoutStore] = useDesignerLayoutStore() || [];
  const formData = useFormContext();
  const [graph, setGraph] = useGraph();
  const [isEditing, setIsEditing] = createSignal(false);
  const [inputValue, setInputValue] = createSignal(props.label ?? "");

  const position = createMemo(() =>
    !props.position || props.position === "system"
      ? formData.formMeta?.P.position || "top"
      : props.position,
  );

  const getFlexDirection = () => {
    switch (position()) {
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

  const containerStyle = () =>
    ({
      "align-items":
        position() === "left" || position() === "right"
          ? "center"
          : "flex-start",
      display: "flex",
      "flex-direction": getFlexDirection(),
      margin: "10px 0",
      padding: "0px 10px",
      width: "100%",
    }) as JSX.CSSProperties;

  const labelStyle = () => ({
    "margin-bottom": position() === "top" ? "5px" : "0",
    "margin-left": position() === "right" ? "5px" : "0",
    "margin-right": position() === "left" ? "5px" : "0",
    "margin-top": position() === "bottom" ? "5px" : "0",
  });

  const handleBlur = (e: FocusEvent) => {
    setIsEditing(false);
    if (layoutStore.formData?.txnId) {
      mergeVertexProperties(
        layoutStore.formData.txnId,
        props.meta.id,
        graph,
        setGraph,
        { label: (e.currentTarget as HTMLInputElement).value },
      );
    }
  };

  const handleLabelClick = (e: MouseEvent) => {
    if (!layoutStore.formData?.txnId) return;
    setInputValue(props.label ?? "");
    setIsEditing(true);
  };

  const [local, restProps] = splitProps(props, [
    "label",
    "position",
    "children",
    "meta",
    "data"
  ]);
  return (
    <div style={containerStyle()}>
      <Show when={props.label}>
        <Show
          fallback={
            <input
              onBlur={handleBlur}
              onInput={(e) => setInputValue(e.currentTarget.value)}
              ref={(el) => {
                onMount(() => {
                  el.focus();
                });
              }}
              style={{
                background: "transparent",
                border: "none",
                outline: "none",
                width: "100%",
              }}
              type="text"
              value={inputValue()}
            />
          }
          when={!isEditing()}
        >
          <label style={labelStyle()} {...restProps} onClick={handleLabelClick}>
            {props.label}
          </label>
        </Show>
      </Show>
      {props.children}
    </div>
  );
}
