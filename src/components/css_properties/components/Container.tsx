import type { JSXElement } from "solid-js";

export const Container = (props: Readonly<{ children: JSXElement; class?: string }>) => (
  <span
    class={`${props.class ?? ""} flex ai:center flex-shrink:0 jc:space-between min-h:45px w:full`}
  >
    {props.children}
  </span>
);
