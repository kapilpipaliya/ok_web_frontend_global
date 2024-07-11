import { CustomModal } from "./CommonDialog";

export function NestedExpressionBuilder(
  props: Readonly<{
    content: string;
    data?: any;
    meta: any; // Adjust type as per your requirement
    onClose: () => void;
    setValue: (value: any) => void;
    txnId?: number;
  }>,
) {
  // Implement the logic for NestedExpressionBuilder here
  return (
    <CustomModal
      body={<div>{/* Body content */}</div>}
      buttonIcon={"carbon:settings-edit"}
      dialogClass="min-w:30% r:10px p:0"
      footer={(toggle) => (
        <div class={"flex ai:center jc:end"}>{/* Footer content */}</div>
      )}
      title="Nested Expression Builder"
    />
  );
}
