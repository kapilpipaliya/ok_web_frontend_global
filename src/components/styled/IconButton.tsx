import { Icon } from "@iconify-icon/solid";
import { type JSX, Show, splitProps } from "solid-js";

import { STYLES } from "./constants/styles";

export interface IconButtonProps
  extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: string;
  iconClass?: string;
  iconClassList?: { [k: string]: boolean | undefined };
  noCenter?: boolean;
  size?: number | string;
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
  ]);

  return (
    <button
      class={`${local.class ?? ""} ${local.noCenter ? "" : STYLES.iconButton}`}
      type="button"
      {...others}
    >
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
    </button>
  );
}
