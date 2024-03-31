import {Vertex} from "../lib/graph";

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