import type { JSX } from "solid-js";

import "./spinner.css";

export type SpinnerProps = JSX.HTMLAttributes<HTMLProgressElement>;

export function Spinner(props: SpinnerProps) {
  return (
    <progress
      aria-busy="true"
      aria-live="polite"
      class={props.class ? `sb-spinner ${props.class}` : "sb-spinner"}
    />
  );
}
