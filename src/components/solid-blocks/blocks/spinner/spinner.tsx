import { Component, JSX } from "solid-js";

import "../base.css";
import "./spinner.css";

export type SpinnerProps = JSX.HTMLAttributes<HTMLProgressElement>;

export function Spinner(props: SpinnerProps) {
  return (
    <progress
      class={props.class ? `sb-spinner ${props.class}` : "sb-spinner"}
      aria-busy="true"
      aria-live="polite" />
  );
}
