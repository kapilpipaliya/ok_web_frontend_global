import { clientOnly } from "@solidjs/start";
const Tooltip = clientOnly(() => import("~/components/ssr/tooltip/Tooltip"));
const TooltipTrigger = clientOnly(() => import("~/components/ssr/tooltip/TooltipTrigger"));
const TooltipPortal = clientOnly(() => import("~/components/ssr/tooltip/TooltipPortal"));
const TooltipContent = clientOnly(() => import("~/components/ssr/tooltip/TooltipContent"));
const TooltipArrow = clientOnly(() => import("~/components/ssr/tooltip/TooltipArrow"));
import { Icon } from "@iconify-icon/solid";
import { Show } from "solid-js";

import type { Vertex } from "~/lib/graph/graph";

import { ComponentList } from "~/components/page_designer/form_elements/components/ComponentList";
import { DropdownMenu } from "~/components/styled/DropdownMenu";
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
          floatingOptions={{
            flip: true,
            offset: 13,
            shift: true,
          }}
          openDelay={200}
          placement="top"
        >
          <TooltipTrigger
            as="a"
            class="flex ai:center"
            href={getUrl()}
            target="_blank"
          >
            <Icon height={14} icon="ph:info" noobserver width={14} />
          </TooltipTrigger>
          <TooltipPortal>
            <TooltipContent class="rounded-lg bg-corvu-100 px-3 py-2 font-medium corvu-open:animate-in corvu-open:fade-in-50 corvu-open:slide-in-from-bottom-1 corvu-closed:animate-out corvu-closed:fade-out-50 corvu-closed:slide-out-to-bottom-1">
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
              <TooltipArrow class="" />
            </TooltipContent>
          </TooltipPortal>
        </Tooltip>
      </Show>
      <Show when={props.showResetIcon ?? false}>
        <Icon
          class="cursor:pointer fg:purple"
          height={26}
          icon="ph:x"
          noobserver
          onClick={props.onResetIconClick}
          width={26}
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
      useSize={true}
    >
      <ComponentList
        edgeName="ParentComp"
        rootExpression={`g:'Comp[Root]'`}
      />
    </DropdownMenu>
  );
}
