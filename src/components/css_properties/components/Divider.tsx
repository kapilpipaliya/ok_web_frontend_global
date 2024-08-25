import { Show } from "solid-js";

import type { DividerField } from "../constants/FieldSchemaType";

export function Divider(props: Readonly<DividerField>) {
  return (
    <>
      <hr class={"color:lightgrey m:5|0 w:full"} />
      <Show when={props.title}>
        <div class={"f:15"}>{props.title}</div>
      </Show>
    </>
  );
}
