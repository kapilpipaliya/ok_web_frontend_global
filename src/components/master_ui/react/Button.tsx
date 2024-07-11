import clsx from "clsx";
import { type JSX, splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

import type { buttonColors, buttonSizes } from "../core";

import Spinner from "./Spinner";

type ButtonProps = {
  as?: string;
  children?: JSX.Element;
  color?: keyof typeof buttonColors | string;
  disabled?: boolean;
  loading?: boolean;
  round?: boolean;
  rounded?: boolean;
  size?: ({} & string) | keyof typeof buttonSizes;
  square?: boolean;
} & JSX.HTMLAttributes<HTMLElement>;

export function Button(props: ButtonProps) {
  const [local, others] = splitProps(props, [
    "as",
    "children",
    "class",
    "size",
    "color",
    "disabled",
    "round",
    "rounded",
    "square",
    "loading",
  ]);

  return (
    <Dynamic
      component={local.as ?? "button"}
      {...others}
      class={clsx(
        "btn",
        `btn-${local.size ?? "md"}`,
        `btn-${local.color ?? "primary"}`,
        local.round && "round square",
        local.rounded && "rounded",
        local.square && "square",
        local.loading && "loading",
        local.class,
      )}
      disabled={
        (local.as ?? "button") === "button"
          ? local.disabled || local.loading
          : undefined
      }
    >
      {local.children}
      {local.loading && <Spinner class="btn-loading" />}
    </Dynamic>
  );
}
