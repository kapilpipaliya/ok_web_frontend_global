import { For, Show, createSignal } from "solid-js";

import { DynamicCSSComponent } from "~/components/css_properties/components/DynamicCssComponent";

import type { FieldWithCustomProperty } from "../constants/FieldType";

import { useCssEditor, useCssState } from "../context";
import { ButtonGroups } from "./ButtonGroups";

export const FieldWithCustomBox = (props: FieldWithCustomProperty) => {
  const [optionType, setOptionType] = createSignal("all");
  const [cssState, setCssState] = useCssEditor();
  const [state, setState] = useCssState();
  
  const onChangeAllField = () => {
    const currentState = state() ?? '';
    const newState: { [key: string]: string } = { ...cssState[currentState] };
    props.customProperty.forEach((property) => {
      newState[property.name] = cssState[currentState]?.[property.name] || "";
    });
    setCssState(currentState, newState);
  };

  return (
    <div>
      <div
        class="grid ai:end gap:10px grid-template-columns:1fr|20%"
      >
        <DynamicCSSComponent
          value={{
            component: props.mainFieldType ?? "textFieldOptions",
            isLabelOnTop: props.isLabelOnTop,
            label: props.label,
            name: props.name,
            onChangeInput: () => {
              onChangeAllField();
            },
            options: props.options,
            placeholder: "0",
            type: props.inputType ?? "number",
          }}
        />
        <ButtonGroups
          isAddToClass={false}
          isLabelOnTop={false}
          label={false}
          name={props.name}
          onChangeInput={() => {
            if (optionType() === "all") {
              setOptionType("custom");
            } else {
              setOptionType("all");
            }
          }}
          options={[
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
                  value={{
                    component: props.mainFieldType ?? "textFieldOptions",
                    isLabelOnTop: props.isLabelOnTop,
                    label: item.label,
                    name: item.name,
                    options: props.options,
                    placeholder: "0",
                    type: props.inputType ?? "number",
                  }}
                />
              );
            }}
          </For>
        </div>
      </Show>
    </div>
  );
};
