import { createEffect, createSignal, For, Show } from "solid-js";

import { DynamicCSSComponent } from "~/components/css_properties/components/DynamicCssComponent";
import { getLastItem } from "~/lib/data_structure/array/getLastItem";

import type {
  FieldWithCustomProperty,
  GenericField,
} from "../../constants/FieldSchemaType";

import { useCssEditor } from "../../context/CssEditorContext";
import { useCssState } from "../../context/CssStateContext";
import { useRenderContext } from "../../context/RenderContext";
import { ButtonGroups } from "./ButtonGroups";

export const FieldWithCustomBox = (
  props: Readonly<FieldWithCustomProperty>,
) => {
  const [optionType, setOptionType] = createSignal("all");
  const [cssState] = useCssEditor();
  const [state] = useCssState();
  const parentItems = useRenderContext();
  const parentRenderContext = () => getLastItem(parentItems)?.[0];
  const meta = () =>
    parentRenderContext()?.context.meta as unknown as GenericField;

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
      <div class="grid gap:5px grid-template-columns:1fr|63px">
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
          componentName="buttonGroups"
          key={props.key}
          onChange={(value) => {
            setOptionType(value);
          }}
          options={[
            {
              icon: "ph:rectangle",
              key: "allCustom",
              tooltip: "All",
              value: "all",
            },
            {
              icon: "ph:rectangle-dashed",
              key: "customIcon",
              tooltip: "Custom",
              value: "custom",
            },
          ]}
          value={optionType()}
        />
      </div>
      <Show when={optionType() === "custom"}>
        <div
          class={`grid b:1px|solid|lightgray gap:10px grid-template-columns:${props.gridType ?? "repeat(2,auto)"} m:5|10 p:0|10 pb:7 r:5`}
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
