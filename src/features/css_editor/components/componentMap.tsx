import { splitProps } from "solid-js";

import { HtmlField } from "~/components/fields/HtmlField";
import { PROPERTIES } from "~/pages/settings/constants";

import { ArrayComponent } from "./fields/ArrayComponent";
import { ButtonGroups } from "./fields/ButtonGroups";
import { CheckboxField } from "./fields/CheckboxField";
import { ColorPickerInput } from "./fields/ColorPickerInput";
import { DataEditWithCustomDialog } from "./fields/DataEditWithCustomDialog";
import { FieldWithCustomBox } from "./fields/FieldWithCustomBox";
import { Select } from "./fields/Select";
import { TextAreaField } from "./fields/TextArea";
import { TextFieldWithSelect } from "./fields/textfield_with_unit/TextFieldWithSelect";
import { ToggleButton } from "./fields/ToggleButton";

const NumberF = (props: any) => {
  const [local, others] = splitProps(props, ["onChange"]);

  return (
    <input
      class={PROPERTIES.Css.TextField}
      onChange={local.onChange}
      type="number"
      {...others}
    />
  );
};
export const componentMap: Record<string, any> = {
  array: ArrayComponent,
  boolean: CheckboxField,
  box: HtmlField,
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
