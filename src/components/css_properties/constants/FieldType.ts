import type { JSXElement } from "solid-js";

export type CustomProperty = {
  label: string;
  name: string;
};

interface Field {
  componentName: string;
}
interface CSSField extends Field {
  hashName?: string;
  info?: string;
  name: string;
  projections?: [];
}

// field with all and custom property
export interface FieldWithCustomProperty extends CSSField {
  align?: string;
  componentName: "fieldWithCustomProperty";
  customProperty: CustomProperty[];
  "grid-template-columns"?: string;
  gridType: string;
  isLabelOnTop: boolean;
  label: string;
  mainFieldType: ComponentKeyType;
  options?: { label: string; value: string }[] | string[];
  padding?: string;
  type?: string;
}

export interface ColorPickerField extends CSSField {
  componentName: "colorPicker";
  isAddToClass?: boolean;
  isLabelOnTop: boolean;
  label: string;
  onChangeInput?: (value: string) => void;
}

export interface GridField extends CSSField {
  children: GenericField[];
  componentName: "grid";
  gap: string;
  "grid-template-columns": string;
  padding: string;
}

export interface AnotherOption {
  icon?: string;
  label: string;
  value: string;
}
export type OptionType = AnotherOption[] | string[];

// text field with unit options
export interface TextFieldOptionsField extends CSSField {
  componentName: "textFieldOptions";
  inputProps?: any;
  isAddToClass?: boolean;
  isLabelOnTop?: boolean;
  label: string;
  leftIcon?: JSXElement;
  onChangeInput?: (value: string) => void;
  options: OptionType;
  placeholder?: string;
  showInside?: boolean;
  type?: string;
  unitOptions?: string[];
  // value?: string; // depricated
}

export interface ToggleField extends CSSField {
  componentName: "toggleButton";
  isAddToClass?: boolean;
  isLabelOnTop?: boolean;
  label: string;
  onChangeInput?: (value: string) => void;
  options: { icon?: boolean; key: string; value: string }[];
}

// box-shadow
export interface DataEditorField extends CSSField {
  children: {
    [key: string]: GenericField;
  };
  componentName: "dataEditor";
  dialogLabel: string;
  fallback?: string; // not used?
  label: string;
}
export interface SelectField extends CSSField {
  componentName: "select";
  isAddToClass?: boolean;
  isLabelOnTop: boolean;
  label: string;
  onChangeInput?: (label: string, value: string) => void;
  options: ({ label: string; value: string } | string)[] | string[];
  value?: string;
}

export interface ButtonGroupField extends CSSField {
  componentName: "buttonGroups";
  isAddToClass?: boolean;
  isLabelOnTop: boolean;
  label: string;
  onChangeInput?: (value: string) => void;
  options: {
    icon?: true;
    key: string;
    tooltip?: string;
    value: string;
  }[];
}

export interface StringField extends CSSField {
  componentName: "select";
  isLabelOnTop: boolean;
  label: string;
  options: string[];
}

export interface DividerField extends Field {
  componentName: "divider";
  label: string;
  title?: string;
}

export type GenericField =
  | ButtonGroupField
  | ColorPickerField
  | DataEditorField
  | DividerField
  | FieldWithCustomProperty
  | GridField
  | SelectField
  | StringField
  | TextFieldOptionsField
  | ToggleField;

export type ComponentKeyType = GenericField["componentName"];

export type CSSJSONSchemaType = {
  [section: string]: { [key: string]: GenericField };
};
export type CSSJSONSectionFilterDetail = {
  isOpen: boolean;
  propertyFieldMap: { [key: string]: GenericField };
};
export type CSSJSONSchemaSearchType = {
  [section: string]: CSSJSONSectionFilterDetail;
};

export function createButtonGroupOptions(
  name: string,
  label: string,
  iconOptions: { key: string; tooltip?: string; value: string }[],
  isLabelOnTop = true,
): ButtonGroupField {
  return {
    componentName: "buttonGroups",
    isLabelOnTop,
    label,
    name,
    options: iconOptions.map(({ key, tooltip, value }) => ({
      icon: true,
      key,
      tooltip,
      value,
    })),
  };
}

export const createGridOptions = (
  name: string,
  _label: string,
  children: GenericField[],
): GridField => ({
  children,
  componentName: "grid",
  gap: "5px|10px",
  "grid-template-columns": "repeat(2,auto)",
  name,
  padding: "5px",
});

export function createSelectOptions(
  name: string,
  label: string,
  options: ({ label: string; value: string } | string)[] | string[],
  isLabelOnTop = false,
): SelectField {
  return {
    componentName: "select",
    isLabelOnTop,
    label,
    name,
    options,
  };
}
