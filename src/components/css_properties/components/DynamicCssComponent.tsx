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
          name={props.value.name}
          onChangeInput={props.value.onChangeInput}
          isAddToClass={props.value.isAddToClass ?? true}
          label={props.value.label}
          isLabelOnTop={props.value.isLabelOnTop}
        />
      </Match>
      <Match when={props.value.component === "select"}>
        <DisplaySelector
          infoLink={props.value.infoLink}
          isAddToClass={props.value.isAddToClass ?? true}
          value={props.value.value}
          onRemoveIconClick={props.value.onRemoveIconClick}
          name={props.value.name}
          label={props.value.label}
          isLabelOnTop={props.value.isLabelOnTop}
          options={props.value.options}
          onChangeInput={props.value.onChangeInput}
        />
      </Match>
      <Match when={props.value.component === "toggleButton"}>
        <ToggleButton
          infoLink={props.value.infoLink}
          onChangeInput={props.value.onChangeInput}
          isAddToClass={props.value.isAddToClass ?? true}
          isLabelOnTop={props.value.isLabelOnTop}
          label={props.value.label}
          name={props.value.name}
          options={props.value.options}
        />
      </Match>
      <Match when={props.value.component === "textField"}>
        <TextFieldWithSelect
          value={props.value.value}
          infoLink={props.value.infoLink}
          isAddToClass={props.value.isAddToClass ?? true}
          name={props.value.name}
          isLabelOnTop={props.value.isLabelOnTop}
          label={props.value.label}
          onChangeInput={props.value.onChangeInput}
          placeholder={props.value.placeholder}
          leftIcon={props.value.leftIcon}
          options={props.value.options}
          showInside={props.value.showInside}
          inputType={props.value.type}
        />
      </Match>
      <Match when={props.value.component === "textFieldOptions"}>
        <TextFieldWithSelect
          infoLink={props.value.infoLink}
          value={props.value.value}
          isAddToClass={props.value.isAddToClass ?? true}
          name={props.value.name}
          showInside={true}
          leftIcon={props.value.leftIcon}
          isLabelOnTop={props.value.isLabelOnTop}
          onChangeInput={props.value.onChangeInput}
          label={props.value.label}
          placeholder={props.value.placeholder}
          inputType={props.value.type}
          options={props.value.options}
        />
      </Match>
      <Match when={props.value.component === "grid"}>
        <div
          style={{
            padding: props.value.padding || 0,
            display: "grid",
            gap: props.value.gap || 10,
            "align-items": props.value.align || "center",
            "grid-template-columns": props.value["grid-template-columns"],
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
          isLabelOnTop={props.value.isLabelOnTop}
          name={props.value.name}
          onChangeInput={props.value.onChangeInput}
          isAddToClass={props.value.isAddToClass ?? true}
          label={props.value.label}
          options={props.value.options}
        />
      </Match>
      <Match when={props.value.component === "fieldWithCustomProperty"}>
        <FieldWithCustomBox
        
          isLabelOnTop={props.value.isLabelOnTop}
          customProperty={props.value.customProperty}
          gridType={props.value.gridType}
          component={props.value.component}
          name={props.value.name}
          inputType={props.value.inputType}
          label={props.value.label}
          mainFieldType={props.value.mainFieldType}
          options={props.value.options}
        />
      </Match>
      <Match when={props.value.component === "dataEditor"}>
        <DataEditWithCustomDialog
          infoLink={props.value.infoLink}
          dialogLabel={props.value.dialogLabel}
          fallback={props.value.fallback}
          name={props.value.name}
          centerComponent={props.value.centerComponent}
          children={props.value.children}
          openMenu={props.value.openMenu[0]}
          setOpenMenu={props.value.openMenu[1]}
          label={props.value.label}
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
