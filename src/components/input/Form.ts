
import {JSX, JSXElement} from "solid-js";

// Id is used as string because its used as object keys.
export type Id = number;

export type FormResult = Map<string, {[key: string]: any}>;

export interface InitialValues {
  [formId: string]: {id: Id, start?: Id, end?: Id, properties: {[key: string]: any}}
}
export enum DataType {
    String= "String",
    Boolean= "Boolean",
    Integer= "Integer",
    Float= "Float",
    List= "List",
    Map= "Map",
    Duration = "Duration",
    Date = "Date",
    LocalTime = "LocalTime",
    LocalDateTime = "LocalDateTime",
  // Table= "table",
  // TableForm= "table_forms",
  // Select= "select",
  // ButtonGroup= "buttongroup",

}

interface BaseField {
  id: string;
  tab?: string;
  group?: string;
  // one of type or component is required.
  dataType?: string;
  component?: string;
  label?: string;
  hidden?: boolean;
  readonly ?: boolean;
  required?: boolean;
  disabled?: boolean;
  onchange?: string
  props?: {[key: string]: any}
  defaultValue?: string;
}

export interface SelectField extends BaseField {
  component: 'Select' | 'Tag';
  collection: number | string;
  displayExpr: string;
}

export interface TableFieldAttributeBase {
  noOverWrite?: boolean;
  noInput?: boolean;
}
export type TableFieldAttributes = (BaseField & TableFieldAttributeBase) | (SelectField & TableFieldAttributeBase) | (TableField & TableFieldAttributeBase)

export interface TableField extends BaseField {
  component: 'Table' | 'TableForm';

  // postSubmit?: (formValues: IFormGroup, formGroup: IFormGroup, tableItemFormGroup: IFormGroup, values: FormResult)=>void
  attributes: TableFieldAttributes[];
  columns: TableFieldAttributes[];

  noSort?: boolean;
}
// - if label is "save" and we don't pass a onclick function, it runs a default save function.
// - the save button should be disabled until anything changed.
export interface ButtonItem {
  design: "Default" | "Transparent" | "Positive" | "Negative" | "Attention" | "Emphasized";
  onclick: () => void;
  children?: JSX.Element;
}
export interface ButtonGroupField extends BaseField {
  component: 'ButtonGroup';
  buttons: ButtonItem[]
}
export type FieldAttribute = BaseField | SelectField | TableField | ButtonGroupField

export interface FormMetaData {
  title: string;
  attributes: FieldAttribute[];
  label: string; // required to create new vertex
  // postSubmit?: (data: any) => any
}


// ********
// Types
// ********

export interface Vertex {
  id: Id;
  labels: string[];
  properties: {[key: string]: any},
  in_edges: {[key: string]: Id[]},
  out_edges: {[key: string]: Id[]}
}

export interface Edge {
  id: Id;
  properties: {[key: string]: any},
  type: string;
  start: Id;
  end: Id;
}
// ********
