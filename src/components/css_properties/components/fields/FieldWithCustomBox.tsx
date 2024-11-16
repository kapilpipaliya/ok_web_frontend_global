import { Accessor, createEffect, createSignal, For, Show } from "solid-js";

import { DynamicCSSComponent } from "~/components/css_properties/components/DynamicCssComponent";

import type {
  ButtonGroupField,
  FieldWithCustomProperty,
  GenericField,
  TextFieldOptionsField,
} from "../../constants/FieldSchemaType";

import { useCssEditor } from "../../context/CssEditorContext";
import { useCssState } from "../../context/CssStateContext";
import { ButtonGroups } from "./ButtonGroups";
import { getLastItem } from "~/lib/data_structure/array/getLastItem";
import { useRenderContext } from "../../context/RenderContext";

export const FieldWithCustomBox = (
  props: Readonly<FieldWithCustomProperty>,
) => {
  const [optionType, setOptionType] = createSignal("all");
  const [cssState] = useCssEditor();
  const [state] = useCssState();
  const [parentContext] = useRenderContext();
  const meta = () => parentContext?.[0].context.meta as unknown as GenericField;

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
              ...meta(),
              componentName: props.mainFieldType ?? "string",
              hideLabel: true,
              type: props.type ?? "text",
            } as GenericField
          }
        />
        <ButtonGroups
          value={optionType()}
          componentName="buttonGroups"
          key={props.key}
          onChange={(value) => {
            setOptionType(value);
          }}
          options={[
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
          ]}
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
                      ...meta(),
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
