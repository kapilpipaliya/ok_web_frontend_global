export type Id = number;

export interface ComponentProps {
 meta: Vertex;
 data: Vertex;

 errors?: string[];
 "aria-labeledby"?: string;

 setValue(attribute: Vertex, data: any): void;
}

export interface FieldAttribute {
 id: string;
 tab?: string;
 group?: string;
 dataType?: string;
 meta?: string;
 component: string;
 title?: string;
 props?: { [key: string]: any };
 // postSubmit?: (formValues: IFormGroup, formGroup: IFormGroup, tableItemFormGroup: IFormGroup, values: FormResult)=>void
 attributes?: FieldAttribute[];
}

export interface FormMetaData {
 id: string; // required to create new vertex
 title: string;
 attributes: FieldAttribute[];
 local?: boolean;
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
