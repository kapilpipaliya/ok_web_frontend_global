import { For, Match, Show, Switch } from "solid-js";

import { ButtonGroups } from "~/components/css_properties/components/ButtonGroups";
import { ColorPickerInput } from "~/components/css_properties/components/ColorPickerInput";
import { DataEditWithCustomDialog } from "~/components/css_properties/components/DataEditWithCustomDialog";
import { DisplaySelector } from "~/components/css_properties/components/DisplaySelector";
import { FieldWithCustomBox } from "~/components/css_properties/components/FieldWithCustomBox";
import { TextFieldWithSelect } from "~/components/css_properties/components/TextFieldWithSelect";
import { ToggleButton } from "~/components/css_properties/components/ToggleButton";

export function DynamicCSSComponent(props: { value: any }) {
  return (
    <Switch>
      <Match when={props.value.component === "colorPicker"}>
        <ColorPickerInput
          infoLink={props.value.infoLink}
          isAddToClass={props.value.isAddToClass ?? true}
          isLabelOnTop={props.value.isLabelOnTop}
          label={props.value.label}
          name={props.value.name}
          onChangeInput={props.value.onChangeInput}
        />
      </Match>
      <Match when={props.value.component === "select"}>
        <DisplaySelector
          infoLink={props.value.infoLink}
          isAddToClass={props.value.isAddToClass ?? true}
          isLabelOnTop={props.value.isLabelOnTop}
          label={props.value.label}
          name={props.value.name}
          onChangeInput={props.value.onChangeInput}
          onRemoveIconClick={props.value.onRemoveIconClick}
          options={props.value.options}
          value={props.value.value}
        />
      </Match>
      <Match when={props.value.component === "toggleButton"}>
        <ToggleButton
          infoLink={props.value.infoLink}
          isAddToClass={props.value.isAddToClass ?? true}
          isLabelOnTop={props.value.isLabelOnTop}
          label={props.value.label}
          name={props.value.name}
          onChangeInput={props.value.onChangeInput}
          options={props.value.options}
        />
      </Match>
      <Match when={props.value.component === "textField"}>
        <TextFieldWithSelect
          infoLink={props.value.infoLink}
          inputType={props.value.type}
          isAddToClass={props.value.isAddToClass ?? true}
          isLabelOnTop={props.value.isLabelOnTop}
          label={props.value.label}
          leftIcon={props.value.leftIcon}
          name={props.value.name}
          onChangeInput={props.value.onChangeInput}
          options={props.value.options}
          placeholder={props.value.placeholder}
          showInside={props.value.showInside}
          value={props.value.value}
        />
      </Match>
      <Match when={props.value.component === "textFieldOptions"}>
        <TextFieldWithSelect
          infoLink={props.value.infoLink}
          inputType={props.value.type}
          isAddToClass={props.value.isAddToClass ?? true}
          isLabelOnTop={props.value.isLabelOnTop}
          label={props.value.label}
          leftIcon={props.value.leftIcon}
          name={props.value.name}
          onChangeInput={props.value.onChangeInput}
          options={props.value.options}
          placeholder={props.value.placeholder}
          showInside={true}
          value={props.value.value}
        />
      </Match>
      <Match when={props.value.component === "grid"}>
        <div
          style={{
            "align-items": props.value.align || "center",
            display: "grid",
            gap: props.value.gap || 10,
            "grid-template-columns": props.value["grid-template-columns"],
            padding: props.value.padding || 0,
          }}
        >
          <For each={props.value.children}>
            {(item) => {
              return <DynamicCSSComponent value={item} />;
            }}
          </For>
        </div>
      </Match>
      <Match when={props.value.component === "buttonGroups"}>
        <ButtonGroups
          infoLink={props.value.infoLink}
          isAddToClass={props.value.isAddToClass ?? true}
          isLabelOnTop={props.value.isLabelOnTop}
          label={props.value.label}
          name={props.value.name}
          onChangeInput={props.value.onChangeInput}
          options={props.value.options}
        />
      </Match>
      <Match when={props.value.component === "fieldWithCustomProperty"}>
        <FieldWithCustomBox
        
          component={props.value.component}
          customProperty={props.value.customProperty}
          gridType={props.value.gridType}
          inputType={props.value.inputType}
          isLabelOnTop={props.value.isLabelOnTop}
          label={props.value.label}
          mainFieldType={props.value.mainFieldType}
          name={props.value.name}
          options={props.value.options}
        />
      </Match>
      <Match when={props.value.component === "dataEditor"}>
        <DataEditWithCustomDialog
          centerComponent={props.value.centerComponent}
          children={props.value.children}
          dialogLabel={props.value.dialogLabel}
          fallback={props.value.fallback}
          infoLink={props.value.infoLink}
          label={props.value.label}
          name={props.value.name}
          openMenu={props.value.openMenu[0]}
          setOpenMenu={props.value.openMenu[1]}
        />
      </Match>
      <Match when={props.value.component === "divider"}>
        <hr class={"w:full color:lightgrey m:5|0"} />
        <Show when={props.value.title}>
          <div class={"f:15"}>{props.value.title}</div>
        </Show>
      </Match>
      <Match when={true}>{JSON.stringify(props.value)}</Match>
    </Switch>
  );
}
