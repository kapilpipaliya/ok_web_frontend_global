export interface NsMetaJson {
  label: string;
  id: string;
  supportCustomFields: boolean;
  searchOnly: boolean;
  supportDeletedRecordSearch: boolean;
  fields: Field[];
  sublists: Sublist[];
  searchFilters: Search[];
  searchColumns: Search[];
  searchJoins: SearchJoin[];
  tabs: Tab[];
  transformTypes: TransformType[];
  searchData?: SearchData;
}

export interface Field {
  id: string;
  type: Type;
  nlapiSubmitField?: boolean;
  label: string;
  required: boolean;
  help: string;
}

export enum Type {
  Address = "address",
  Bigdecimal = "bigdecimal",
  Ccexpdate = "ccexpdate",
  Ccnumber = "ccnumber",
  Ccvalidfrom = "ccvalidfrom",
  Checkbox = "checkbox",
  Clobtext = "clobtext",
  Currency = "currency",
  Currency2 = "currency2",
  Date = "date",
  Datetime = "datetime",
  Datetimetz = "datetimetz",
  Double = "double",
  Email = "email",
  Emails = "emails",
  File = "file",
  Float = "float",
  Identifier = "identifier",
  Identifieranycase = "identifieranycase",
  Image = "image",
  Integer = "integer",
  Label = "label",
  Mmyydate = "mmyydate",
  Multiselect = "multiselect",
  Namevaluelist = "namevaluelist",
  Nonnegfloat = "nonnegfloat",
  Password = "password",
  Percent = "percent",
  Period = "period",
  Phone = "phone",
  Poscurrency = "poscurrency",
  Posfloat = "posfloat",
  Posinteger = "posinteger",
  Radio = "radio",
  Rate = "rate",
  Ratehighprecision = "ratehighprecision",
  Richtext = "richtext",
  Rtext = "rtext",
  Select = "select",
  Ssnumber = "ssnumber",
  Summary = "summary",
  Text = "text",
  Textarea = "textarea",
  Time = "time",
  Timeofday = "timeofday",
  Timetrack = "timetrack",
  URL = "url",
  Year = "year",
}

export interface Search {
  id: string;
  type: Type;
  label: string;
}

export enum SearchData {
  Item = "item",
  Transaction = "transaction",
}

export interface SearchJoin {
  id: string;
  description: string;
  actualName: string;
}

export interface Sublist {
  id: string;
  label: string;
  fields: Field[];
}

export interface Tab {
  name: string;
  label: string;
}

export interface TransformType {
  targetRecordType: string;
  fieldDefaults: string;
}
