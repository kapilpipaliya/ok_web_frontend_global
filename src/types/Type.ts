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
