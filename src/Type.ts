export enum Alert {
 Error= "Negative",
 Warning= "Warning",
 Success= "Positive",
 Information= "Information"
}

export interface AlertMessage {
 hideIcon?: boolean;
 hideCloseButton?: boolean;
 message: string;
 state: Alert;
}