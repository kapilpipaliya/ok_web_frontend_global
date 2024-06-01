import { Component, type JSX } from "solid-js";

import "../base.css";
import "./progress.css";

export type ProgressProps = JSX.ProgressHTMLAttributes<HTMLProgressElement>;

export function Progress(props: ProgressProps) {
  return (
    <progress
      aria-busy={props?.value !== props?.max}
      aria-live="polite"
      {...props}
      class={props.class ? `sb-progress ${props.class}` : "sb-progress"}
    />
  );
}
