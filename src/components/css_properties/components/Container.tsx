import type { JSXElement } from "solid-js";

export function Container(props: Readonly<{ children: JSXElement; class?: string; }>) {
  return (
    <span
      class={`${props.class ?? ""} flex ai:center flex-shrink:0 jc:space-between min-h:45px w:full`}
    >
      {props.children}
    </span>
  );
}
