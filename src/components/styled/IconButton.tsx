import { Icon } from "@iconify-icon/solid";
import { type JSX, Show, splitProps } from "solid-js";

import { createTapClickHandler } from "~/lib/event/rowPointer";
import { STYLES } from "~/pages/settings/constants";
import { As } from "../As";
import { TooltipWrapper } from "./modal/TooltipWrapper";
import { ensureArray } from "~/lib/data_structure/array/ensureArray";

import type { CssType } from "~/components/form/type/CssType";

export type IconButtonProps = {
  href?: string;
  icon?: string;
  iconCss?: CssType;
  iconClassList?: { [k: string]: boolean | undefined };
  noCenter?: boolean;
  size?: number | string;
  target?: string;
  title?: JSX.Element | string;
  tooltipGroup?: string;
  css?: CssType;
} & (
  | (Omit<JSX.AnchorHTMLAttributes<HTMLAnchorElement>, "title"> & {
      href: string;
    })
  | (Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, "title"> & {
      href?: undefined;
    })
);

export function IconButton(props: Readonly<IconButtonProps>): JSX.Element {
  const [local, rest] = splitProps(props, [
    "icon",
    "class",
    "iconCss",
    "iconClassList",
    "size",
    "children",
    "noCenter",
    "title",
    "tooltipGroup",
    "css",
    "onClick",
    "onPointerDown",
    "onPointerUp",
  ]);

  const tap =
    local.onClick && !props.href
      ? createTapClickHandler((event) => {
          if (typeof local.onClick === "function") {
            local.onClick(event as MouseEvent);
          }
        })
      : null;

  const triggerProps = {
    ...rest,
    onClick: tap?.onClick ?? local.onClick,
    onPointerDown: (event: PointerEvent) => {
      tap?.onPointerDown(event);
      if (typeof local.onPointerDown === "function") {
        local.onPointerDown(event);
      }
    },
    onPointerUp: (event: PointerEvent) => {
      tap?.onPointerUp(event);
      if (typeof local.onPointerUp === "function") {
        local.onPointerUp(event);
      }
    },
  };

  const ButtonContent = () => (
    <>
      <Show when={local.icon}>
        <As
          as={Icon}
          css={local.iconCss}
          classList={local.iconClassList}
          height={local.size ?? 24}
          icon={local.icon!}
          noobserver
          width={local.size ?? 24}
        />
      </Show>
      {local.children}
    </>
  );

  const InnerContent = () => (
    <Show
      fallback={
        <As
          as="button"
          css={[
            local.noCenter ? "" : STYLES.iconButtonCss,
            ...ensureArray(local.css),
          ]}
          type="button"
          {...(triggerProps as JSX.ButtonHTMLAttributes<HTMLButtonElement>)}
        >
          <ButtonContent />
        </As>
      }
      when={props.href}
    >
      <As
        as="a"
        css={[
          ...ensureArray(local.css),
          local.noCenter ? "" : STYLES.iconButtonCss,
        ]}
        href={props.href!}
        target={props.target}
        {...(triggerProps as JSX.AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        <ButtonContent />
      </As>
    </Show>
  );

  return (
    <Show fallback={<InnerContent />} when={local.title}>
      <TooltipWrapper
        content={local.title}
        group={local.tooltipGroup}
        openDelay={300}
        triggerAs={props.href ? "a" : "button"}
        triggerCss={[
          ...ensureArray(local.css),
          local.noCenter ? "" : STYLES.iconButtonCss,
        ]}
        {...(triggerProps as JSX.ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        <ButtonContent />
      </TooltipWrapper>
    </Show>
  );
}
