import { Icon } from "@iconify-icon/solid";
import { Show } from "solid-js";

import { IconButton } from "~/components/styled/IconButton";
import Tooltip from "@corvu/tooltip";
import { Vertex } from "~/lib/graph/graph";
import { DropdownMenu } from "~/components/styled/DropdownMenu";
import { ComponentList } from "~/components/page_designer/form_elements/components/ComponentList";
/*
┌───────────┐
│Title x ?  │
└───────────┘
 */
interface ContainerLabelProps {
  class?: string;
  hashName?: string;
  info?: string;
  onResetIconClick?: () => void;
  showResetIcon?: boolean;
  title: string;
}

export const ContainerLabel = (props: Readonly<ContainerLabelProps>) => {
  const getUrl = () => {
    return `https://developer.mozilla.org/en-US/docs/Web/CSS/${props.info}${
      props.hashName ? `#${props.hashName}` : ""
    }`;
  };

  return (
    <span
      class={`${
        props.class ?? ""
      } flex ai:center font-weight:400 font:14 gap:5 white-space:nowrap`}
    >
      {props.title}
      <Show when={props.info}>
        <Tooltip
          placement="top"
          openDelay={200}
          floatingOptions={{
            offset: 13,
            flip: true,
            shift: true,
          }}
        >
          <Tooltip.Trigger as="a" href={getUrl()} target="_blank" class="flex ai:center">
            <Icon icon="mdi:information-outline" width={14} height={14} />
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content class="rounded-lg bg-corvu-100 px-3 py-2 font-medium corvu-open:animate-in corvu-open:fade-in-50 corvu-open:slide-in-from-bottom-1 corvu-closed:animate-out corvu-closed:fade-out-50 corvu-closed:slide-out-to-bottom-1">
              <div
                class={
                  "center bg:#333 color:#fff f:13 font-family:poppins font-weight:300 max-w:fit-content min-w:fit-content p:3|10 r:5 text:nowrap w:full z-index:1"
                }
              >
                <Show when={props.title}>
                  <div class={"f:14 font-weight:500"}>{props.title}</div>
                </Show>
                {"Click for more Info"}
              </div>
              <Tooltip.Arrow class="" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip>
      </Show>
      <Show when={props.showResetIcon ?? false}>
        <Icon
          class="cursor:pointer fg:purple"
          icon="mdi:close"
          onClick={props.onResetIconClick}
          width={20}
          height={20}
        />
      </Show>
    </span>
  );
};

export function InsertButtonsMenu(
  props: Readonly<{
    item: Vertex;
    onClose: () => void;
    onMouseLeave: () => void;
    parentRef: HTMLElement;
  }>,
) {
  return (
    <DropdownMenu
      class="padding:0.50rem"
      onMouseLeave={props.onMouseLeave}
      parentRef={props.parentRef}
    >
      <ComponentList />
    </DropdownMenu>
  );
}
