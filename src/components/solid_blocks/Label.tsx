import { type JSX, useContext } from "solid-js";
import { FormSettingsContext } from "~/lib/contexts";

interface LabeledFieldProps {
  label: string;
  position?: "top" | "left" | "right" | "bottom" | "system";
  children: JSX.Element;
}

export const Label = (props: LabeledFieldProps) => {
  const [formSettingContext, setFormSettingContext] =
    useContext(FormSettingsContext);

  const getFlexDirection = () => {
    const position =
      props.position === "system"
        ? formSettingContext.labelPosition
        : props.position;
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
    "align-items":
      props.position === "left" || props.position === "right"
        ? "center"
        : "flex-start",
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

  return (
    <div style={containerStyle()}>
      <label style={labelStyle()} {...props}>
        {props.label}
      </label>
      {props.children}
    </div>
  );
};

export default Label;
