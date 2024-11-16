import { For } from "solid-js";

import type { FormField, GenericField } from "../constants/FieldSchemaType";

import { DynamicCSSComponent } from "./DynamicCssComponent";

export function RenderChildren(
  props: Readonly<{ meta: GenericField; projections?: (number | string)[] }>,
) {
  const getProjections = (item: GenericField) => {
    if ((props.meta as FormField).useParentProjection) {
      const combinedProjections = [...(props.projections || []), ...(item.projections || [])];
      return combinedProjections.length > 0 ? combinedProjections : undefined;
    }
    return undefined;
  };

  return (
    <For each={(props.meta as { children: GenericField[] }).children}>
      {(item) => (
        <DynamicCSSComponent
          meta={item}
          projections={getProjections(item)}
        />
      )}
    </For>
  );
}
