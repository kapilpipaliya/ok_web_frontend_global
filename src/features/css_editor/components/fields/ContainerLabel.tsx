import { Icon } from "@iconify-icon/solid";
import { Show } from "solid-js";

import type { Vertex } from "~/lib/graph/graph";

import { DropdownMenu } from "~/components/styled/DropdownMenu";
import { TooltipWrapper } from "~/components/styled/TooltipWrapper";
import { ComponentList } from "~/features/page_designer/form_elements/components/ComponentList";
import {STYLES} from "~/pages/settings/constants";
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
        <TooltipWrapper
          content={
            <div class={STYLES.tooltip.content}>
              <Show when={props.title}>
                <div class={"f:14 font-weight:500"}>{props.title}</div>
              </Show>
              {"Click for more Info"}
            </div>
          }
          triggerAs="a"
        >
          <a
            class="flex ai:center"
            href={getUrl()}
            rel="noreferrer"
            target="_blank"
          >
            <Icon height={14} icon="ph:info" noobserver width={14} />
          </a>
        </TooltipWrapper>
      </Show>
      <Show when={props.showResetIcon ?? false}>
        <Icon
          class="cursor:pointer fg:accent"
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
      <ComponentList edgeName="ParentComp" rootExpression={`g:'Comp[Root]'`} />
    </DropdownMenu>
  );
}
