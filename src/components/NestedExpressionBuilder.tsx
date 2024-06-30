import {CustomModal} from "./CommonDialog";

export function NestedExpressionBuilder(props: Readonly<{
  content: string;
  meta: any; // Adjust type as per your requirement
  setValue: (value: any) => void;
  txnId?: number;
  data?: any;
  onClose: () => void;
}>) {
  // Implement the logic for NestedExpressionBuilder here
  return (
    <CustomModal
      buttonIcon={"carbon:settings-edit"}
      title="Nested Expression Builder"
      body={<div>{/* Body content */}</div>}
      footer={(toggle) => (
        <div class={"flex ai:center jc:end"}>{/* Footer content */}</div>
      )}
      dialogClass="min-w:30% r:10px p:0"
    />
  );
}
