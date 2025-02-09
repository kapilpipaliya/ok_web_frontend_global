import type { JSX } from "solid-js";

import Tooltip from "@corvu/tooltip";

import { STYLES } from "./constants/styles";

export function TooltipWrapper(props: {
  arrowClass?: string;
  children: JSX.Element;
  content: JSX.Element;
  triggerAs?: string;
  triggerClass?: string;
}) {
  return (
    <Tooltip
      floatingOptions={{
        flip: true,
        offset: 13,
        shift: true,
      }}
      openDelay={200}
      placement="top"
    >
      <Tooltip.Trigger as={props.triggerAs} class={props.triggerClass}>
        {props.children}
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          class={`rounded-lg bg:rgb(243,244,246) px-3 py-2 font-medium ${STYLES.tooltip.animation}`}
        >
          {props.content}

          <Tooltip.Arrow class={props.arrowClass} />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip>
  );
}
