
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
  // one of type or component is required.
  serverType?: string;
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
  collection?: string;
  edge?: string;
  form?: string;
  postSubmit?: (formValues: IFormGroup, formGroup: IFormGroup, tableItemFormGroup: IFormGroup, values: FormResult)=>void
  attributes: TableFieldAttributes[];

  data: {properties: {}}[]; // Edges[]
  defaultValueFn: (control: IFormGroup, key: string)=>JSXElement;
  save: (txnId: number, results: FormResult, tableData: any[]) => any;
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
  label: string;
  // save: ["vertex", VertexLabels]
  //     // we can pass initialValues to start and end function when needed
  //     | ['edge', EdgeLabels, ((results: FormResult, formValue: object)=> Id) | undefined, ((results: FormResult, formValue: object)=> Id) | undefined]
  //     // if start and end function are not provided than it will not save anything
  //     | ['edge', EdgeLabels]
  // when there is more than one forms we provide data fn for each form
  // for vertex and edges we return data in Vertex and Edge format
  data?: (id: Id) => any
  postSubmit?: (data: any) => any
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

export enum VertexLabels {
  // Base
  DataType = "DataType", // all type of the server
  Component = "Component", // all input components for the servertype
  Attribute = "Attribute",
  CollectionCategory = "CollectionCategory",
  Collection = "Collection",
  FormLayout = "FormLayout",
  FormLayoutItem = "FormLayoutItem",
  TableLayout = "TableLayout",
  CardLayout = "CardLayout",
  // Auth
  User = "User",
  Role = "Role",
  Permission = "Permission",
}

export enum EdgeLabels {
  DataTypeComponent = "DataTypeComponent",
  CollectionHasChild = "CollectionHasChild",
  CollectionHasAttribute = "CollectionHasAttribute",
  FormLayoutItemHasCollection = "FormLayoutItemHasCollection",
  FormLayoutItemHasAttribute = "FormLayoutItemHasAttribute",
  FormLayoutHasItem = "FormLayoutHasItem",
  TableLayoutHasAttribute = "TableLayoutHasAttribute",
}

// ********
