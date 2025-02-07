import type { JSX } from "solid-js";

import { createMemo } from "solid-js";

export interface MenuChildProps {
  children?: JSX.Element | MenuChildRenderProp;
  disabled?: boolean;
}

export type MenuChildRenderProp = (properties: MenuProperties) => JSX.Element;

export interface MenuProperties {
  disabled: () => boolean;
}

export function MenuChild(props: MenuChildProps): JSX.Element {
  return createMemo(() => {
    const body = props.children;
    if (typeof body === "function") {
      return body({
        disabled: () => !!props.disabled,
      });
    }
    return body;
  }) as unknown as JSX.Element;
}
