import type { JSX } from "solid-js";

import { STYLES } from "./constants/styles";

export function Table(
  props: Readonly<{ children: JSX.Element; class?: string; headers: number }>,
) {
  return (
    <div class={`${STYLES.overflow} position:relative r:10`}>
      <div
        class={`${props.class || ""} grid bb:2px|solid|#37c font-size:0.9em grid-template-columns:repeat(${props.headers},1fr) ${STYLES.overflow} r:10 width:100%`}
      >
        {props.children}
      </div>
    </div>
  );
}

export function TableBodyCell(
  props: Readonly<{
    children: JSX.Element;
    class?: string;
    index?: number;
  }>,
) {
  return (
    <div
      class={`${props.class ?? ""} @fade|.4s align-content:center p:2 text:center`}
      classList={{
        "bg:#3478cc0d": props.index ? props.index % 2 !== 0 : false,
        "bg:white": props.index ? props.index % 2 === 0 : false,
      }}
    >
      {props.children}
    </div>
  );
}

export function TableHeadCell(props: Readonly<{ children: JSX.Element }>) {
  return (
    <div class="bg:#37c border:1px|solid|#347fdd color:white font-weight:600 p:10px text-align:center">
      {props.children}
    </div>
  );
}
