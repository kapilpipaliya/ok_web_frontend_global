import type { JSXElement } from "solid-js";


export const CenterDiv = (props: { children: JSXElement; }) => (
  <div class={"flex ai:center jc:space-between w:full"}>{props.children}</div>
);
