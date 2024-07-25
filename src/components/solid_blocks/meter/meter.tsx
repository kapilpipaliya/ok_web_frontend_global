import type { JSX } from "solid-js";

import "./meter.css";

export type MeterProps = {
  max?: number | string;
  min?: number | string;
  value?: number | string;
} & JSX.HTMLAttributes<HTMLDivElement>;

export function Meter(props: Readonly<MeterProps>) {
  return (
    <div
      {...props}
      aria-valuemax={props.max ?? props["aria-valuemax"]}
      aria-valuemin={props.min ?? props["aria-valuemin"]}
      aria-valuenow={props.value ?? props["aria-valuenow"]}
      class={props.class ? `sb-meter ${props.class}` : "sb-meter"}
      role={
        "meter" as MeterProps["role"] /* https://github.com/ryansolid/dom-expressions/pull/79 */
      }
    >
      <svg
        aria-hidden="true"
        viewBox={`0 0 ${props.max ?? props["aria-valuemax"]} 10`}
      >
        <rect
          height="10"
          width={props.value ?? props["aria-valuenow"] ?? 0}
          x="0"
          y="0"
        />
      </svg>
      {props.children}
    </div>
  );
}
