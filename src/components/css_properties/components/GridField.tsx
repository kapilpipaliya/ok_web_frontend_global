import { type Accessor, For } from "solid-js";

import { getLastItem } from "~/lib/data_structure/array/getLastItem";

import type { DividerField } from "../constants/FieldSchemaType";

import { useRenderContext } from "../RenderContext";
import { DynamicCSSComponent } from "./DynamicCssComponent";


export function GridField() {
  const [parentItems] = useRenderContext();
  const meta = getLastItem(parentItems?.meta || []) as Accessor<DividerField>;

  return (
    <div
      class={`grid ai:${meta().align || "center"} gap:${meta().gap || 10} grid-template-cols:${meta()["grid-template-columns"]} p:${meta().padding || 0}`}
    >
      <For each={meta().children}>
        {(item) => {
          return (
            <DynamicCSSComponent
              value={{
                ...item,
                projections: [
                  ...(meta.projections || []),
                  ...(item.projections || []),
                ],
              }} />
          );
        }}
      </For>
    </div>
  );
}
