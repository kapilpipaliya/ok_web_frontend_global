import { For, Match, Show, Switch } from "solid-js";

import { ButtonGroups } from "~/components/css_properties/components/ButtonGroups";
import { ColorPickerInput } from "~/components/css_properties/components/ColorPickerInput";
import { DataEditWithCustomDialog } from "~/components/css_properties/components/DataEditWithCustomDialog";
import { FieldWithCustomBox } from "~/components/css_properties/components/FieldWithCustomBox";
import { Select } from "~/components/css_properties/components/Select";
import { TextFieldWithSelect } from "~/components/css_properties/components/TextFieldWithSelect";
import { ToggleButton } from "~/components/css_properties/components/ToggleButton";

import type { GenericField, TextFieldOptionsField, } from "../constants/FieldType";

import { ComponentMetaContext } from "../context";

export function DynamicCSSComponent(props: Readonly<{ value: GenericField }>) {
  return (
    <Switch>
      <Match when={props.value.componentName === "colorPicker"}>
        <ComponentMetaContext.Provider value={props.value}>
          <ColorPickerInput />
        </ComponentMetaContext.Provider>
      </Match>
      <Match when={props.value.componentName === "select"}>
        <ComponentMetaContext.Provider value={props.value}>
          <Select />
        </ComponentMetaContext.Provider>
      </Match>
      <Match when={props.value.componentName === "toggleButton"}>
        <ComponentMetaContext.Provider value={props.value}>
          <ToggleButton />
        </ComponentMetaContext.Provider>
      </Match>
      <Match when={props.value.componentName === "textField"}>
        <ComponentMetaContext.Provider value={props.value}>
          <TextFieldWithSelect />
        </ComponentMetaContext.Provider>
      </Match>
      <Match when={props.value.componentName === "textFieldOptions"}>
        <ComponentMetaContext.Provider value={{ ...(props.value as TextFieldOptionsField), showInside: true }}>
          <TextFieldWithSelect />
        </ComponentMetaContext.Provider>
      </Match>
      <Match when={props.value.componentName === "grid"}>
        <div  
          class={`grid ai:${props.value.align || "center"} gap:${props.value.gap || 10} grid-template-cols:${props.value["grid-template-columns"]} p:${props.value.padding || 0}`}
        >
          <For each={props.value.children}>
            {(item) => {
              return <DynamicCSSComponent value={{ ...(item), projections: [...(props.value.projections || []), ...(item.projections || [])] }} />;
            }}
          </For>
        </div>
      </Match>
      <Match when={props.value.componentName === "buttonGroups"}>
        <ComponentMetaContext.Provider value={props.value}>
          <ButtonGroups />
        </ComponentMetaContext.Provider>
      </Match>
      <Match when={props.value.componentName === "fieldWithCustomProperty"}>
        <ComponentMetaContext.Provider value={props.value}>
          <FieldWithCustomBox />
        </ComponentMetaContext.Provider>
      </Match>
      <Match when={props.value.componentName === "dataEditor"}>
        <ComponentMetaContext.Provider value={props.value}>
          <DataEditWithCustomDialog />
        </ComponentMetaContext.Provider>
      </Match>
      <Match when={props.value.componentName === "divider"}>
        <hr class={"color:lightgrey m:5|0 w:full"} />
        <Show when={props.value.title}>
          <div class={"f:15"}>{props.value.title}</div>
        </Show>
      </Match>
      <Match when={true}>{JSON.stringify(props.value)}</Match>
    </Switch>
  );
}
