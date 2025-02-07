import type { JSXElement } from "solid-js";

export interface AnotherOption {
  icon?: string;
  label: string;
  value: string;
}

export interface ArrayField
  extends Omit<TextFieldOptionsField, "componentName"> {
  componentName: "array";
}

export interface BoxField extends Field {
  children?: GenericField[];
  componentName: "box";
  key?: string;
}

export interface ButtonGroupField extends FormField {
  componentName: "buttonGroups";
  options: {
    icon?: string;
    key: string;
    tooltip?: string;
    value: string;
  }[];
}

export interface ColorPickerField extends FormField {
  componentName: "colorPicker";
  isLabelOnTop: boolean;
  label: string;
}

export type ComponentKeyType = GenericField["componentName"];

export type CSSJSONSchemaSearchType = {
  [section: string]: CSSJSONSectionFilterDetail;
};
export type CSSJSONSchemaType = {
  [section: string]: { [key: string]: GenericField };
};

export type CSSJSONSectionFilterDetail = {
  isOpen: boolean;
  propertyFieldMap: { [key: string]: GenericField };
};

export type CustomProperty = {
  key: string;
  label: string;
};

// box-shadow
export interface DataEditorField extends FormField {
  children: GenericField[];
  componentName: "dataEditor";
  dialogLabel: string;
  fallback?: string; // not used?
  label: string;
}

export interface Field {
  class?: string;
  componentName: string;
  projections?: (number | string)[];
  useParentProjection?: boolean;
}

// field with all and custom property
export interface FieldWithCustomProperty extends FormField {
  align?: string;
  componentName: "fieldWithCustomProperty";
  customProperty: CustomProperty[];
  "grid-template-columns"?: string;
  gridType: string;
  isLabelOnTop: boolean;
  label: string;
  mainFieldType: ComponentKeyType;
  options?: string[] | { label: string; value: string }[];
  padding?: string;
  type?: string;
  unitOptions?: string[];
}

export interface FormField extends Field {
  hashName?: string;
  hideLabel?: boolean;
  info?: string;
  key: string;
  onChange?: (value: any) => void;
  value?: any;
}

export type GenericField =
  | ArrayField
  | BoxField
  | ButtonGroupField
  | ColorPickerField
  | DataEditorField
  | FieldWithCustomProperty
  | SelectField
  | StringField
  | TextFieldOptionsField
  | ToggleField;

export type OptionType = AnotherOption[] | string[];

export interface SelectField extends FormField {
  componentName: "select";
  isLabelOnTop: boolean;
  label: string;
  options: (string | { label: string; value: string })[] | string[];
  value?: string;
}

export interface StringField extends FormField {
  componentName: "select";
  isLabelOnTop: boolean;
  label: string;
  options: string[];
}
// text field with unit options
export interface TextFieldOptionsField extends FormField {
  componentName: "string";
  containerClass?: string;
  inputProps?: any;
  isLabelOnTop?: boolean;
  label: string;
  leftIcon?: JSXElement;
  options: OptionType;
  placeholder?: string;
  showFilePicker?: boolean;
  type?: string;
  unitOptions?: string[];
  // value?: string; // depricated
}
export interface ToggleField extends FormField {
  componentName: "toggleButton";
  isLabelOnTop?: boolean;
  label: string;
  options: { icon?: string; key: string; value: string }[];
}

export function createButtonGroupOptions(
  key: string,
  label: string,
  iconOptions: { key: string; tooltip?: string; value: string }[],
  isLabelOnTop = true,
): ButtonGroupField {
  return {
    componentName: "buttonGroups",
    isLabelOnTop,
    key,
    label,
    options: iconOptions.map(({ key, tooltip, value }) => ({
      icon: true,
      key,
      tooltip,
      value,
    })),
  };
}

export const createGridOptions = (
  key: string,
  label: string,
  children: GenericField[],
): BoxField => ({
  children,
  class: "grid ai:center gap:5px|10px grid-template-cols:repeat(2,auto) p:5px",
  componentName: "box",
  key,
  useParentProjection: true,
});

export function createSelectOptions(
  key: string,
  label: string,
  options: (string | { label: string; value: string })[] | string[],
  isLabelOnTop = false,
): SelectField {
  return {
    componentName: "select",
    isLabelOnTop,
    key,
    label,
    options,
  };
}
