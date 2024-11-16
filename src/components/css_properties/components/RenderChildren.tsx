import { For } from "solid-js";

import type { FormField, GenericField } from "../constants/FieldSchemaType";

import { DynamicCSSComponent } from "./DynamicCssComponent";

export function RenderChildren(
  props: Readonly<{ meta: GenericField; projections?: (number | string)[] }>,
) {
  return (
    <For
      each={
        (props.meta as { children: GenericField[] } & GenericField).children
      }
    >
      {(item: GenericField) => {
        return (
          <DynamicCSSComponent
            meta={item}
            projections={
              (props.meta as FormField).useParentProjection
                ? [...(props.projections || []), ...(item.projections || [])]
                : undefined
            }
          />
        );
      }}
    </For>
  );
}
