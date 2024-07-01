export interface IFormMetaData {
  attributes: FieldAttribute[];
  isInlineEditable?: boolean;
  isRealTime?: boolean;
  name: string; // required to create new vertex
  title: string;
}

export interface FieldAttribute {
  [key: string]: any;
  // postSubmit?: (formValues: IFormGroup, formGroup: IFormGroup, tableItemFormGroup: IFormGroup, values: FormResult)=>void
  attributes?: FieldAttribute[];
  component: string;
  // group?: string;
  dataType?: string;
  displayName?: string;
  meta?: string;

  name: string;
   tab?: string;
  
  validationRules?: Array<{}>;
}
