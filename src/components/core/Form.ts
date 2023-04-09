export type Id = number;

export interface ComponentProps {
  meta: Vertex;
  data: Vertex;

  errors?: string[];
  "aria-labeledby"?: string;

  setValue(attribute: Vertex, data: any): void;
}
export interface DisplayComponentProps {
  meta: Vertex;
  data: Vertex;
}

export interface Vertex {
  id: Id;
  labels: string[];
  properties: { [key: string]: any };
  in_edges: { [key: string]: Id[] };
  out_edges: { [key: string]: Id[] };
}

export interface Edge {
  id: Id;
  properties: { [key: string]: any };
  type: string;
  start: Id;
  end: Id;
}
