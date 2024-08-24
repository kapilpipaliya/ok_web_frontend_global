import { type Accessor, createEffect, createSignal, For, Show } from "solid-js";
import { createStore } from "solid-js/store";

import { DynamicCSSComponent } from "~/components/css_properties/components/DynamicCssComponent";
import { getLastItem } from "~/lib/data_structure/array/getLastItem";

import type {
  ButtonGroupField,
  FieldWithCustomProperty,
  GenericField,
} from "../constants/FieldSchemaType";

import {
  useCssEditor,
  useCssState,
} from "../CssEditorContext";
import { RenderContextProvider, useRenderContext } from "../RenderContext";
import { ButtonGroups } from "./ButtonGroups";

export const FieldWithCustomBox = () => {
  const [parentItems] = useRenderContext();
  const meta = getLastItem(
    parentItems?.meta || [],
  ) as Accessor<FieldWithCustomProperty>;
  const [optionType, setOptionType] = createSignal("all");
  const [cssState] = useCssEditor();
  const [state] = useCssState();

  createEffect(() => {
    if (meta().customProperty && meta().customProperty.length > 0) {
      let isValueSet = false;
      meta().customProperty.forEach((property) => {
        if (cssState[state()]?.[property.name] !== undefined) {
          isValueSet = true;
        }
      });
      if (isValueSet) {
        setOptionType("custom");
      }
    }
  });
  const repeterStore = createStore({
    meta: [] as Accessor<GenericField>[],
  });
  return (
    <div>
      <div class="grid ai:end gap:10px grid-template-columns:1fr|20%">
        <DynamicCSSComponent
          value={
            {
              ...meta(),
              componentName: meta().mainFieldType ?? "textFieldOptions",
              type: meta().type ?? "text",
            } as GenericField
          }
        />
            <RenderContextProvider meta={() => (            {
              componentName: "buttonGroups",
              isAddToClass: false,
              isLabelOnTop: false,
              label: "",
              name: meta().name,
              onChangeInput: () => {
                if (optionType() === "all") {
                  setOptionType("custom");
                } else {
                  setOptionType("all");
                }
              },
              options: [
                {
                  icon: true,
                  key: "allCustom",
                  tooltip: "All",
                  value: "all",
                },
                {
                  icon: true,
                  key: "customIcon",
                  tooltip: "Custom",
                  value: "custom",
                },
              ],
            } as ButtonGroupField)} store={repeterStore}>
          <ButtonGroups />
        </RenderContextProvider>
      </div>
      <Show when={optionType() === "custom"}>
        <div
          class={`grid ai:end b:1px|solid|lightgray gap:10px grid-template-columns:${meta().gridType ?? "repeat(2,auto)"} m:5|10 p:0|10 pb:7 r:5`}
        >
          <For each={meta().customProperty}>
            {(item) => {
              return (
                <DynamicCSSComponent
                  value={
                    {
                      ...meta(),
                      componentName: meta().mainFieldType ?? "textFieldOptions",
                      type: meta().type ?? "text",
                      ...item,
                    } as GenericField
                  }
                />
              );
            }}
          </For>
        </div>
      </Show>
    </div>
  );
};
