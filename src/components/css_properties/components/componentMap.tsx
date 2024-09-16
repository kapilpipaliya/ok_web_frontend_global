import { splitProps } from "solid-js";

import { PROPERTIES } from "~/components/constants/constant";
import { BoxField } from "~/components/fields/BoxField";
import { NumberField } from "~/kobalte/packages/core/src/number-field";

import { DataEditWithCustomDialog } from "./DataEditWithCustomDialog";
import { ButtonGroups } from "./fields/ButtonGroups";
import { CheckboxField } from "./fields/CheckboxField";
import { ColorPickerInput } from "./fields/ColorPickerInput";
import { Select } from "./fields/Select";
import { TextAreaField } from "./fields/TextArea";
import { ArrayComponent } from "./fields/ArrayComponent";
import { TextFieldWithSelect } from "./fields/textfield_with_unit/TextFieldWithSelect";
import { ToggleButton } from "./fields/ToggleButton";
import { FieldWithCustomBox } from "./FieldWithCustomBox";
const NumberF = (props: any) => {
  const [local, others] = splitProps(props, ["onChange"]);

  return (
    <NumberField onChange={local.onChange}>
      <NumberField.Input {...others} class={PROPERTIES.Css.TextField} />
    </NumberField>
  );
};
export const componentMap: Record<string, any> = {
  array: ArrayComponent,
  boolean: CheckboxField,
  box: BoxField,
  buttonGroups: ButtonGroups,
  colorPicker: ColorPickerInput,
  dataEditor: DataEditWithCustomDialog,
  fieldWithCustomProperty: FieldWithCustomBox,
  number: NumberF,
  select: Select,
  string: TextFieldWithSelect,
  textArea: TextAreaField,
  textField: TextFieldWithSelect,
  toggleButton: ToggleButton,
};
