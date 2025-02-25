import Tooltip from "@corvu/tooltip";
import { type JSX, splitProps } from "solid-js";

import { STYLES } from "~/pages/settings/constants";

export function TooltipWrapper(props: {
  arrowClass?: string;
  children: JSX.Element;
  content: JSX.Element;
  group?: string;
  openDelay?: number;
  triggerAs?: string;
  triggerClass?: string;
}) {
  const [_local, others] = splitProps(props, [
    "children",
    "content",
    "group",
    "openDelay",
    "triggerAs",
    "triggerClass",
    "arrowClass",
  ]);
  return (
    <Tooltip
      closeDelay={0}
      floatingOptions={{
        flip: true,
        offset: 13,
        shift: true,
      }}
      group={props.group}
      openDelay={props.openDelay ?? 200}
      placement="top"
    >
      <Tooltip.Trigger
        as={props.triggerAs}
        class={props.triggerClass}
        {...others}
      >
        {props.children}
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          class={`r:8 bg:base-20 text:base-90 p:8 font-medium ${STYLES.tooltip.animation}`}
        >
          {props.content}

          <Tooltip.Arrow class={`color:base-20 ${props.arrowClass ?? ""}`} />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip>
  );
}
