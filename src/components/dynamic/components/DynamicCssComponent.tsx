import { For, Match, Show, Switch } from "solid-js";
import { StyleCSSComponents } from "~/components/css-editor/StyleCSSComponents";

export function DynamicCSSComponent(props: { value: any }) {
  const {
    DisplaySelector,
    ButtonGroups,
    DataEditor,
    ColorPickerInput,
    ToggleButton,
    FieldWithCustomProperty,
    TextFieldWithSelectOption,
  } = StyleCSSComponents();
  return (
    <Switch>
      <Match when={props.value.component === "colorPicker"}>
        <ColorPickerInput
          name={props.value.name}
          onChangeInput={props.value.onChangeInput}
          isAddToClass={props.value.isAddToClass ?? true}
          label={props.value.label}
          isLabelOnTop={props.value.isLabelOnTop}
        />
      </Match>
      <Match when={props.value.component === "select"}>
        <DisplaySelector
          name={props.value.name}
          label={props.value.label}
          isLabelOnTop={props.value.isLabelOnTop}
          options={props.value.options}
        />
      </Match>
      <Match when={props.value.component === "toggleButton"}>
        <ToggleButton
          onChangeInput={props.value.onChangeInput}
          isAddToClass={props.value.isAddToClass ?? true}
          isLabelOnTop={props.value.isLabelOnTop}
          label={props.value.label}
          name={props.value.name}
          options={props.value.options}
        />
      </Match>
      <Match when={props.value.component === "textField"}>
        <TextFieldWithSelectOption
          value={props.value.value}
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
        <TextFieldWithSelectOption
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
            padding: props.value["padding"] || 0,
            display: "grid",
            gap: props.value["gap"] || 10,
            "align-items": props.value["align"] || "center",
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
          isLabelOnTop={props.value.isLabelOnTop}
          name={props.value.name}
          onChangeInput={props.value.onChangeInput}
          isAddToClass={props.value.isAddToClass ?? true}
          label={props.value.label}
          options={props.value.options}
        />
      </Match>
      <Match when={props.value.component === "fieldWithCustomProperty"}>
        <FieldWithCustomProperty
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
        <DataEditor
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
