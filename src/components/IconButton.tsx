import { Icon } from "@iconify-icon/solid";
import { type JSX, Show, splitProps } from "solid-js";
export interface IconButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: string;
  iconCss?: string
  ref?: (element: HTMLButtonElement) => void;
  size?: number;
}

export function IconButton(props: Readonly<IconButtonProps>) {
  const [local, others] = splitProps(props, ['icon', 'class', 'iconCss', 'size', 'children']);

  return (
    <button
      class={`${local.class ?? ''} ai:center d:inline-flex`}
      {...others}
    >
      <Show when={local.icon}><Icon class={local.iconCss ?? ''} height={local.size ?? 24} icon={local.icon!} width={local.size ?? 24} /></Show>
      {local.children}
    </button>
  );
}
