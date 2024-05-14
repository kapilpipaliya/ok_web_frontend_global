import { Vertex } from "~/lib/graph/graph";

export interface ComponentProps {
  meta: Vertex;
  data?: Vertex;

  disabled?: boolean;
  "aria-labeledby"?: string;

  setValue?(data: any): void;
}

export interface DisplayComponentProps {
  meta?: Vertex;
  data?: Vertex;
}
