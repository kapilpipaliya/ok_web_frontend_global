import { Icon } from "@iconify-icon/solid";
import { type JSX, Show, splitProps } from "solid-js";

import { STYLES } from "~/pages/settings/constants";

import { TooltipWrapper } from "./modal/TooltipWrapper";

export type IconButtonProps = {
  href?: string;
  icon?: string;
  iconClass?: string;
  iconClassList?: { [k: string]: boolean | undefined };
  noCenter?: boolean;
  size?: number | string;
  target?: string;
  title?: JSX.Element | string;
  tooltipGroup?: string;
} & (
  | (Omit<JSX.AnchorHTMLAttributes<HTMLAnchorElement>, "title"> & {
      href: string;
    })
  | (Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, "title"> & {
      href?: undefined;
    })
);

export function IconButton(props: Readonly<IconButtonProps>) {
  const [local, others] = splitProps(props, [
    "icon",
    "class",
    "iconClass",
    "iconClassList",
    "size",
    "children",
    "noCenter",
    "title",
    "tooltipGroup",
  ]);

  const ButtonContent = () => (
    <>
      <Show when={local.icon}>
        <Icon
          class={local.iconClass ?? ""}
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
        <button
          class={`${local.class ?? ""} ${local.noCenter ? "" : STYLES.iconButton}`}
          type="button"
          {...(others as JSX.ButtonHTMLAttributes<HTMLButtonElement>)}
        >
          <ButtonContent />
        </button>
      }
      when={props.href}
    >
      <a
        class={`${local.class ?? ""} ${local.noCenter ? "" : STYLES.iconButton}`}
        href={props.href!}
        target={props.target}
        {...(others as JSX.AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        <ButtonContent />
      </a>
    </Show>
  );

  return (
    <Show fallback={<InnerContent />} when={local.title}>
      <TooltipWrapper
        arrowClass={STYLES.tooltip.arrow}
        content={
          <div class={STYLES.tooltip.content}>
            <div class={"f:14 font-weight:500"}>{local.title}</div>
          </div>
        }
        group={local.tooltipGroup}
        openDelay={300}
        triggerAs={props.href ? "a" : "button"}
        triggerClass={`${local.class ?? ""} ${local.noCenter ? "" : STYLES.iconButton}`}
        {...others}
      >
        <ButtonContent />
      </TooltipWrapper>
    </Show>
  );
}
