import {
  type JSX,
  Show,
  createMemo,
  splitProps,
} from "solid-js";

import { useFormContext } from "~/lib/contexts";

import type { GenericComponentProps } from "../fields/ComponentType";

interface LabeledFieldProps {
  children: JSX.Element;
  label?: string;
  position?: "bottom" | "left" | "right" | "system" | "top";
}

export function Label(
  props: GenericComponentProps &
    JSX.IntrinsicAttributes &
    JSX.LabelHTMLAttributes<HTMLLabelElement> &
    LabeledFieldProps,
) {

  const formData = useFormContext();

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

  const [local, restProps] = splitProps(props, [
    "label",
    "position",
    "children",
    "meta",
    "data"
  ]);
  return (
    <div style={containerStyle()}>
      <Show when={local.label}>
        <label style={labelStyle()} {...restProps}>
          {local.label}
        </label>
      </Show>
      {local.children}
    </div>
  );
}
