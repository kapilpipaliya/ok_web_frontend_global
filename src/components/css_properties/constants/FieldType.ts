import type { Signal } from "solid-js";

export type CustomProperty = {
  label: string;
  name: string;
};

interface Field {
  component: string;
}

export interface FieldWithCustomProperty extends Field {
  align?: string
  component: "fieldWithCustomProperty",
  customProperty: CustomProperty[];
  "grid-template-columns"?: string;
  gridType: string;
  isLabelOnTop: boolean;
  label: string;
  mainFieldType: string;
  name: string;
  options?: { label: string; value: string }[] | string[];
  padding?: string;
  type?: string;
};

export interface ColorPickerField extends Field {
  component: "colorPicker";
  isLabelOnTop: boolean;
  label: string;
  name: string;
}

export interface GridField extends Field {
  children: GenericField[]
  component: "grid";
  gap: string;
  "grid-template-columns": string;
  name: string;
  "padding": string;
}

export interface TextFieldOptionsField extends Field {
  component: "textFieldOptions";
  isAddToClass: boolean;
  isLabelOnTop: boolean;
  label: string;
  name: string;
  options: string[]// { label: string; value: string }[];
  type: string;
}

export interface ToggleField extends Field {
  component: "toggleButton",
  label: string,
  name: string,
  options: { icon?: boolean, key: string, value: string }[],
}

export interface DataEditorField extends Field {
  children: {
    data?: ColorPickerField,
    easing?: SelectField,
    shadow: GridField,
    style?: ToggleField,
    type?: SelectField
  }
  component: "dataEditor";
  dialogLabel: string;
  fallback: string;
  label: string;
  name: string;
  openMenu: Signal<boolean | null>;
}

export interface SelectField extends Field {
  component: "select";
  isLabelOnTop: boolean,
  label: string,
  name: string,
  options:{label: string, value: string}[] | string[]
}

export interface ButtonGroupField extends Field {
  component: "buttonGroups";
  isLabelOnTop: boolean;
  label: string;
  name: string;
  options: {
    icon: true,
    key: string,
    tooltip?: string,
    value: string,
  }[],
}

export interface StringField extends Field {
  component: "select";
  isLabelOnTop: boolean,
  label: string,
  name: string,
  options: string[],
}

export interface DividerField extends Field {
  component: "divider";
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

export type CSSJSONSchemaType = { [section: string]: { [key: string]: GenericField } };
export type CSSJSONSectionFilterDetail = { isOpen: boolean; propertyFieldMap: { [key: string]: GenericField } }
export type CSSJSONSchemaSearchType = { [section: string]: CSSJSONSectionFilterDetail };

export function createButtonGroupOptions(name: string,
  label: string,
  iconOptions: { key: string; tooltip?: string; value: string; }[],
  isLabelOnTop = true): ButtonGroupField {
  return ({
    component: "buttonGroups",
    isLabelOnTop,
    label,
    name,
    options: iconOptions.map(({ key, tooltip, value }) => ({
      icon: true,
      key,
      tooltip,
      value,
    })),
  });
}

export const createGridOptions = (name: string, label: string, children: GenericField[]): GridField => ({
  children,
  component: "grid",
  gap: "5px 10px",
  "grid-template-columns": "repeat(2, auto)",
  name,
  padding: "5px",
});

export function createSelectOptions(name: string,
  label: string,
  options: { label: string; value: string; }[] | string[],
  isLabelOnTop = false): SelectField {
  return ({
    component: "select",
    isLabelOnTop,
    label,
    name,
    options,
  });
}
