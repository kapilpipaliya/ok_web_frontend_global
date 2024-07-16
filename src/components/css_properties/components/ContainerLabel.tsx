import { Icon } from "@iconify-icon/solid";
import { Show } from "solid-js";

import { CustomTooltip } from "~/components/Tooltip";

/*
┌───────────┐
│Title x ?  │
└───────────┘
 */
interface ContainerLabelProps {
  class?: string;
  info?: string;
  name?: string;
  onResetIconClick?: () => void;
  showResetIcon?: boolean;
  title: string;
}

export const ContainerLabel = (props: ContainerLabelProps) => {
  const handleInfoClick = () => {
    const url = `https://developer.mozilla.org/en-US/docs/Web/CSS/${props.info}${props.name ? `#${props.name}` : ""}`;
    window.open(url, "_blank");
  };

  return (
    <span class={`${props.class ?? ""} flex ai:center font-weight:400 font:14 gap:2`}>
      {props.title}
      <Show when={props.showResetIcon ?? false}>
        &nbsp;
        <Icon
          class="cursor:pointer fg:purple"
          icon="mdi:close"
          onClick={props.onResetIconClick}
        />
      </Show>
      <Show when={props.info}>
        <CustomTooltip message="Click for more Info" title={props.title}>
          <button class="flex cursor:pointer" onClick={handleInfoClick} type="button">
            <Icon height={14} icon="mdi:information-outline" width={14} />
          </button>
        </CustomTooltip>
      </Show>
    </span>
  );
};
