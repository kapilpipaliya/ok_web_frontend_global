import { type Accessor, Match, Switch } from "solid-js";
import { createStore } from "solid-js/store";
import { Dynamic } from "solid-js/web";

import { ButtonGroups } from "~/components/css_properties/components/ButtonGroups";
import { ColorPickerInput } from "~/components/css_properties/components/ColorPickerInput";
import { DataEditWithCustomDialog } from "~/components/css_properties/components/DataEditWithCustomDialog";
import { FieldWithCustomBox } from "~/components/css_properties/components/FieldWithCustomBox";
import { Select } from "~/components/css_properties/components/Select";
import { ToggleButton } from "~/components/css_properties/components/ToggleButton";

import type { GenericField } from "../constants/FieldSchemaType";

import { RenderContextProvider } from "../RenderContext";
import { Divider } from "./Divider";
import { GridField } from "./GridField";
import { NotFoundComponent } from "./NotFoundComponent";
import { TextFieldWithSelect } from "./textfield_with_unit/TextFieldWithSelect";

const componentMap: Record<string, any> = {
  buttonGroups: ButtonGroups,
  colorPicker: ColorPickerInput,
  dataEditor: DataEditWithCustomDialog,
  divider: Divider,
  fieldWithCustomProperty: FieldWithCustomBox,
  grid: GridField,
  select: Select,
  textField: TextFieldWithSelect,
  textFieldOptions: TextFieldWithSelect,
  toggleButton: ToggleButton,
};

const repeterStore = createStore({
  meta: [] as Accessor<GenericField>[],
});

export function DynamicCSSComponent(props: Readonly<{ value: GenericField }>) {
  const Component = () =>
    componentMap[props.value.componentName] || NotFoundComponent;

  const Content = () => {
    return (
      <>
        <Dynamic
          component={Component()}
          // onChange={onChange}
          // value={value()}
          // {...otherMeta}
          // {...otherProps}
        />
      </>
    );
  };

  return (
    <RenderContextProvider meta={() => props.value} store={repeterStore}>
      <Switch>
        {/* <Match when={isHidden()} /> */}
        <Match when={true}>
          <Content />
        </Match>
      </Switch>
    </RenderContextProvider>
  );
}
