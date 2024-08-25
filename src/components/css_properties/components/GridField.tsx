import type { JSX } from "solid-js";

import type { GridField } from "../constants/FieldSchemaType";

export function GridField(
  props: { children: JSX.Element } & Readonly<GridField>,
) {
  return (
    <div
      class={`grid ai:${props.align || "center"} gap:${props.gap || 10} grid-template-cols:${props["grid-template-columns"]} p:${props.padding || 0}`}
    >
      {props.children}
    </div>
  );
}
