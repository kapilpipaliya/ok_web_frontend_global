import { splitProps } from "solid-js";

import { BoxField } from "~/components/fields/BoxField";

import { DataEditWithCustomDialog } from "./fields/DataEditWithCustomDialog";
import { ArrayComponent } from "./fields/ArrayComponent";
import { ButtonGroups } from "./fields/ButtonGroups";
import { CheckboxField } from "./fields/CheckboxField";
import { ColorPickerInput } from "./fields/ColorPickerInput";
import { Select } from "./fields/Select";
import { TextAreaField } from "./fields/TextArea";
import { TextFieldWithSelect } from "./fields/textfield_with_unit/TextFieldWithSelect";
import { ToggleButton } from "./fields/ToggleButton";
import { FieldWithCustomBox } from "./fields/FieldWithCustomBox";
import { PROPERTIES } from "~/components/styled/constants/constant";
const NumberF = (props: any) => {
  const [local, others] = splitProps(props, ["onChange"]);

  return <input onChange={local.onChange} class={PROPERTIES.Css.TextField} type="number" {...others} />;
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
  // This trigger onInput event, so dont use it.
  string: TextFieldWithSelect,
  textArea: TextAreaField,
  textField: TextFieldWithSelect,
  toggleButton: ToggleButton,
};
