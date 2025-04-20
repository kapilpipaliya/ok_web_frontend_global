import { Icon } from "@iconify-icon/solid";
import { Show } from "solid-js";

import type { Vertex } from "~/lib/graph/graph";

import { DropdownMenu } from "~/components/styled/modal/DropdownMenu";
import { TooltipWrapper } from "~/components/styled/modal/TooltipWrapper";
import { ComponentList } from "~/features/page_designer/form_elements/components/ComponentList";
import { STYLES } from "~/pages/settings/constants";
import { As } from "~/components/As";
import { css } from "~/lib/styles";

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
    <As
      as="span"
      css={css`
        ${props.class ?? ""}
        display: flex;
        align-items: center;
        font-weight: 400;
        font-size: 14px;
        gap: 5px;
        white-space: nowrap;
      `}
    >
      {props.title}
      <Show when={props.info}>
        <TooltipWrapper
          arrowCss={STYLES.tooltip.arrowCss}
          content={
            <As
              as="div"
              css={STYLES.tooltip.contentCss}
            >
              <Show when={props.title}>
                <As
                  as="div"
                  css={css`
                    font-size: 14px;
                    font-weight: 500;
                  `}
                >
                  {props.title}
                </As>
              </Show>
              {"Click for more Info"}
            </As>
          }
          triggerAs="a"
        >
          <As
            as="a"
            css={css`
              display: flex;
              align-items: center;
            `}
            href={getUrl()}
            rel="noreferrer"
            target="_blank"
          >
            <Icon height={14} icon="ph:info" noobserver width={14} />
          </As>
        </TooltipWrapper>
      </Show>
      <Show when={props.showResetIcon ?? false}>
        <As as="span" css={args => css`cursor: pointer; color: \${args.theme.var.color.accent};`}>
          <Icon
            height={26}
            icon="ph:x"
            noobserver
            onClick={props.onResetIconClick}
            width={26}
          />
        </As>
      </Show>
    </As>
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
      css={css`padding: 0.50rem;`}
      onMouseLeave={props.onMouseLeave}
      parentRef={props.parentRef}
      useSize={true}
    >
      <ComponentList edgeName="ParentComp" rootExpression={`g:'Comp[Root]'`} />
    </DropdownMenu>
  );
}
