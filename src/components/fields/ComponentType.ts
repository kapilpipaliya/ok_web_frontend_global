import type { Vertex } from "~/lib/graph/graph";

export interface ComponentProps {
  data?: Vertex;
  disabled?: boolean;
  meta: Vertex;
  setValue?(data: any): void;
}

export interface DisplayComponentProps {
  data?: Vertex;
  meta?: Vertex;
}
