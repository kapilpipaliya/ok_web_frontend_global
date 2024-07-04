import { Icon } from "@iconify-icon/solid";
import { type JSXElement, Show } from "solid-js";

import { CustomTooltip } from "~/components/Tooltip";


export const ContainerLabel = (props: {
  class?: any;
  info?: any;
  onIconClick?: any;
  showIcon?: boolean;
  title: JSXElement;
}) => (
  <span
    class={`${props.class} flex ai:center font-weight:400 font:14 m:0 pt:5`}
  >
    {props.title}
    <Show when={props.showIcon ?? false}>
      &nbsp;
      <Icon
        class={"cursor:pointer"}
        icon={"mdi:close"}
        onClick={props.onIconClick}
        style={{ 'color': 'purple' }} />
    </Show>
    <Show when={props.info}>
      <CustomTooltip message={'Click for more Info'} title={props.title}>
        <div class={"flex cursor:pointer"} onClick={() => {
          window.open(`https://developer.mozilla.org/en-US/docs/Web/CSS/${props.info}`, '_blank');
        }}><Icon height={21} icon={"mdi:information-outline"} style={{ 'color': 'lightgray', 'margin-left': '2px' }} width={21} /></div>
      </CustomTooltip>
    </Show>
  </span>
);
