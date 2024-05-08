import { createSignal, splitProps } from "solid-js";
import "./button.css";

const CustomButton = (props) => {
  const [local, field] = splitProps(props, ["class"]);
  const [variant] = createSignal(props.variant || "contained");

  // Define styles for different variants as CSS classes
  const styles = {
    outlined: "outlined-button",
    contained: "contained-button",
    soft: "soft-button",
    custom: "custom-button",
  };
  return (
    <button class={`${styles[variant()]} ${local.class || ""}`} {...field}>
      {props.leading ? <>{props.leading}&nbsp;</> : ""}
      {props.children} {props.trailing ? <>&nbsp;{props.trailing}</> : ""}
    </button>
  );
};

export default CustomButton;
