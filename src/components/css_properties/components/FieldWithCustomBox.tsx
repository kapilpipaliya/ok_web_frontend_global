import { createEffect, createSignal, For, Show } from "solid-js";

import { DynamicCSSComponent } from "~/components/css_properties/components/DynamicCssComponent";

import type {
  ButtonGroupField,
  FieldWithCustomProperty,
  GenericField,
} from "../constants/FieldSchemaType";

import { useCssEditor } from "../CssEditorContext";
import { useCssState } from "../CssStateContext";
import { ButtonGroups } from "./fields/ButtonGroups";

export const FieldWithCustomBox = (
  props: Readonly<FieldWithCustomProperty>,
) => {
  const [optionType, setOptionType] = createSignal("all");
  const [cssState] = useCssEditor();
  const [state] = useCssState();

  createEffect(() => {
    if (props.customProperty && props.customProperty.length > 0) {
      let isValueSet = false;
      props.customProperty.forEach((property) => {
        if (cssState[state()]?.[property.key] !== undefined) {
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
          meta={
            {
              ...props,
              componentName: props.mainFieldType ?? "string",
              hideLabel: true,
              type: props.type ?? "text",
            } as GenericField
          }
        />
        <ButtonGroups
          {...({
            componentName: "buttonGroups",
            isAddToClass: false,
            isLabelOnTop: false,
            key: props.key,
            label: "",
            onChangeInput: () => {
              if (optionType() === "all") {
                setOptionType("custom");
              } else {
                setOptionType("all");
              }
            },
            options: [
              {
                icon: "radix-icons:box",
                key: "allCustom",
                tooltip: "All",
                value: "all",
              },
              {
                icon: "lucide:box-select",
                key: "customIcon",
                tooltip: "Custom",
                value: "custom",
              },
            ],
          } as ButtonGroupField)}
        />
      </div>
      <Show when={optionType() === "custom"}>
        <div
          class={`grid ai:end b:1px|solid|lightgray gap:10px grid-template-columns:${props.gridType ?? "repeat(2,auto)"} m:5|10 p:0|10 pb:7 r:5`}
        >
          <For each={props.customProperty}>
            {(item) => {
              return (
                <DynamicCSSComponent
                  meta={
                    {
                      ...props,
                      componentName: props.mainFieldType ?? "string",
                      type: props.type ?? "text",
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
