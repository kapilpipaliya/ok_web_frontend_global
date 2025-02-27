export interface FieldAttribute {
  [key: string]: any;
  // postSubmit?: (formValues: IFormGroup, formGroup: IFormGroup, tableItemFormGroup: IFormGroup, values: FormResult)=>void
  attributes?: FieldAttribute[];
  componentName: string;
  displayName?: string;
  key?: string;
  meta?: string;
  validationRules?: Array<{}>;
}

export interface IFormMetaData {
  attributes: FieldAttribute[];
  isInlineEditable?: boolean;
  isRealTime?: boolean;
  key?: string; // required to create new vertex
  title?: string;
}
