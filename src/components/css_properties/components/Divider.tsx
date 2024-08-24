import { type Accessor, Show } from "solid-js";

import { getLastItem } from "~/lib/data_structure/array/getLastItem";

import type { DividerField } from "../constants/FieldSchemaType";

import { useRenderContext } from "../RenderContext";


export function Divider() {
  const [parentItems] = useRenderContext();
  const meta = getLastItem(parentItems?.meta || []) as Accessor<DividerField>;

  return (
    <>
      <hr class={"color:lightgrey m:5|0 w:full"} />
      <Show when={meta().title}>
        <div class={"f:15"}>{meta().title}</div>
      </Show>
    </>
  );
}
