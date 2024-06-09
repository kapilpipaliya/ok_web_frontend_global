export interface FormMetaData {
  name: string; // required to create new vertex
  isInlineEditable?: boolean;
  title: string;
  attributes: FieldAttribute[];
  isRealTime?: boolean;
}

export interface FieldAttribute {
  name: string;
  tab?: string;
  // group?: string;
  dataType?: string;
  meta?: string;
  component: string;
  displayName?: string;

  [key: string]: any;
   validationRules?: Array<{}>;
  
  // postSubmit?: (formValues: IFormGroup, formGroup: IFormGroup, tableItemFormGroup: IFormGroup, values: FormResult)=>void
  attributes?: FieldAttribute[];
}
