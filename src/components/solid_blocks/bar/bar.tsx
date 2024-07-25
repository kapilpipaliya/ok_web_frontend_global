import { type JSX, mergeProps, splitProps } from "solid-js";
import { Portal } from "solid-js/web";

import "./bar.css";

export type BarProps = {
  mount?: HTMLElement;
  placement?: "bottom" | "left" | "right" | "top";
  portal?: boolean;
  position?: Omit<JSX.CSSProperties["position"], "static">;
} & JSX.HTMLAttributes<HTMLDivElement>;

export function Bar(props: Readonly<BarProps>) {
  const [local, rest] = splitProps(props, [
    "placement",
    "position",
    "mount",
    "portal",
  ]);
  const divProps = mergeProps(rest, {
    class: `${local.placement}${
      local.position ? ` ${local.position}` : ""
    } sb-bar ${props.class ? ` ${props.class}` : ""}`,
  });
  return local.portal === false ? (
    <div {...divProps} />
  ) : (
    <Portal mount={local.mount}>
      <div {...divProps} />
    </Portal>
  );
}
