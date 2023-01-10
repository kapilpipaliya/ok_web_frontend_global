export enum Alert {
 Error= "Negative",
 Warning= "Warning",
 Success= "Positive",
 Information= "Information"
}

export interface AlertMessage {
 id: string;
 hideIcon?: boolean;
 hideCloseButton?: boolean;
 message: string;
 state: Alert;
}