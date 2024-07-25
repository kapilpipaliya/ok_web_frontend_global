import clsx from "clsx";
import { type JSX, splitProps } from "solid-js";

import type { switchColors, switchSizes } from "../core";

type SwitchProps = {
  color?: ({} & string) | keyof typeof switchColors;
  disabled?: boolean;
  size?: ({} & string) | keyof typeof switchSizes;
} & JSX.InputHTMLAttributes<HTMLInputElement>;

const Switch = (props: Readonly<SwitchProps>) => {
  const [local, others] = splitProps(props, [
    "class",
    "size",
    "color",
    "disabled",
  ]);
  return (
    <label
      class={clsx(
        "switch",
        `switch-${local.size ?? "md"}`,
        `switch-${local.color ?? "primary"}`,
        local.class,
      )}
    >
      <input {...others} class="switch-control" type="checkbox" />
      <svg class="switch-body">
        <rect class="switch-button" />
      </svg>
    </label>
  );
};

export default Switch;
