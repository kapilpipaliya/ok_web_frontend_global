import {Vertex, VertexUnsafe} from "../lib/graph";

export interface ComponentProps {
  meta: Vertex;
  data?: Vertex;

  disabled?: boolean;
  "aria-labeledby"?: string;

  setValue?(attribute: Vertex, vertex: Vertex, data: any): void;
}
export interface DisplayComponentProps {
  // meta?: Vertex;
  meta?: VertexUnsafe;
  // data?: Vertex;
  data?: VertexUnsafe;
}

export enum Alert {
  Error = "danger",
  Warning = "Warning",
  Success = "success",
  Information = "primary",
}

export interface AlertMessage {
  id: string;
  hideIcon?: boolean;
  hideCloseButton?: boolean;
  message: string;
  state: Alert;
}