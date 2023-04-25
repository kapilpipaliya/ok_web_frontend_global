import { Vertex } from "../../lib/graph";

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
