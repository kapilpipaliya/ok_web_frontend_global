import { Icon } from "@iconify-icon/solid";
import { type JSX, splitProps } from "solid-js";
export interface IconButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: string;
  iconCss?: string
  ref?: (element: HTMLButtonElement) => void;
}

export function IconButton(props: IconButtonProps) {
  const [local, others] = splitProps(props, ['icon', 'class', 'iconCss']);

  return (
    <button
      class={`${local.class ?? ''} flex ai:center`}
      {...others}
    >
      <Icon class={local.iconCss ?? ''} height={20} icon={local.icon} width={20} />
    </button>
  );
}
