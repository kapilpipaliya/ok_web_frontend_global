import { Vertex } from "../../lib/graph";

export interface ComponentProps {
  meta: Vertex;
  data: Vertex;

  disabled?: boolean;
  "aria-labeledby"?: string;

  setValue(attribute: Vertex, vertex: Vertex, data: any): void;
}
export interface DisplayComponentProps {
  meta: Vertex;
  data?: Vertex;
}
