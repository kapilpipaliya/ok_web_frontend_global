import { Icon } from "@iconify-icon/solid";
import { type JSX, Show, splitProps } from "solid-js";

import { STYLES } from "~/pages/settings/constants";

import { TooltipWrapper } from "./modal/TooltipWrapper";

export interface IconButtonProps
  extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: string;
  iconClass?: string;
  iconClassList?: { [k: string]: boolean | undefined };
  noCenter?: boolean;
  size?: number | string;
  tooltipGroup?: string;
}

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

  return (
    <Show
      fallback={
        <button
          class={`${local.class ?? ""} ${local.noCenter ? "" : STYLES.iconButton}`}
          type="button"
          {...others}
        >
          <ButtonContent />
        </button>
      }
      when={local.title}
    >
      <TooltipWrapper
        arrowClass={STYLES.tooltip.arrow}
        content={
          <div class={STYLES.tooltip.content}>
            <div class={"f:14 font-weight:500"}>{local.title}</div>
          </div>
        }
        group={local.tooltipGroup}
        openDelay={300}
        triggerClass={`${local.class ?? ""} ${local.noCenter ? "" : STYLES.iconButton}`}
        {...others}
      >
        <ButtonContent />
      </TooltipWrapper>
    </Show>
  );
}
