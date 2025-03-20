import Tooltip from "@corvu/tooltip";
import { type JSX, splitProps } from "solid-js";

import { STYLES } from "~/pages/settings/constants";

export function TooltipWrapper(props: {
  arrowClass?: string;
  children: JSX.Element;
  content: JSX.Element;
  contentClass?: string;
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
          class={`${STYLES.tooltip.animation} ${props.contentClass ?? ""}`}
        >
          {props.content}

          <Tooltip.Arrow class={`${props.arrowClass ?? ""}`} />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip>
  );
}
