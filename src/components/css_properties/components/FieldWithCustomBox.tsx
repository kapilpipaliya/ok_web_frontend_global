import { createEffect, createSignal, For, Show } from "solid-js";

import { DynamicCSSComponent } from "~/components/css_properties/components/DynamicCssComponent";

import type { ButtonGroupField, FieldWithCustomProperty, GenericField } from "../constants/FieldType";

import { ComponentMetaContext, useComponentMeta, useCssEditor, useCssState } from "../CssEditorContext";
import { ButtonGroups } from "./ButtonGroups";

export const FieldWithCustomBox = () => {
  const meta = useComponentMeta() as FieldWithCustomProperty;
  const [optionType, setOptionType] = createSignal("all");
  const [cssState] = useCssEditor();
  const [state] = useCssState();

  createEffect(() => {
    if (meta.customProperty && meta.customProperty.length > 0) {
      let isValueSet = false;
      meta.customProperty.forEach((property) => {
        if (cssState[state()]?.[property.name] !== undefined) {
          isValueSet = true;
        }
      });
      if (isValueSet) {
        setOptionType("custom");
      }
    }
  });
  return (
    <div>
      <div class="grid ai:end gap:10px grid-template-columns:1fr|20%">
        <DynamicCSSComponent
          value={{
            ...meta,
            componentName: meta.mainFieldType ?? "textFieldOptions",
            type: meta.type ?? "text"
          } as GenericField}
        />
        <ComponentMetaContext.Provider value={{
          componentName: "buttonGroups",
          isAddToClass: false,
          isLabelOnTop: false,
          label: "",
          name: meta.name,
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
        } as ButtonGroupField}>
          <ButtonGroups />
        </ComponentMetaContext.Provider>
      </div>
      <Show when={optionType() === "custom"}>
        <div
          class={`grid ai:end b:1px|solid|lightgray gap:10px grid-template-columns:${meta.gridType ?? "repeat(2,auto)"} m:5|10 p:0|10 pb:7 r:5`}
        >
          <For each={meta.customProperty}>
            {(item) => {
              return (
                <DynamicCSSComponent
                  value={{
                    ...meta,
                    componentName: meta.mainFieldType ?? "textFieldOptions",
                    type: meta.type ?? "text",
                    ...item
                  } as GenericField}
                />
              );
            }}
          </For>
        </div>
      </Show>
    </div>
  );
};
