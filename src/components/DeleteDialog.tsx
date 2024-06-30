
import {CustomModal} from "./CommonDialog";
import type { JSX } from "solid-js";

export function DeleteDialog(props: Readonly<{
  onConfirm: () => void;
  title?: string;
  message?: string;
  buttonLabel?: JSX.Element;
  onCancel?: () => void;
  open?: boolean;
  setOpen?: (open: boolean) => void;
}>) {
  const handleConfirm = () => {
    props.onConfirm();
  };

  const handleCancel = () => {
    props.onCancel ? props.onCancel() : () => {};
  };
  return (
    <CustomModal
      bodyStyle={{ "max-height": "none", overflow: "auto" }}
      openButton={false}
      open={props.open}
      setOpen={props.setOpen}
      buttonLabel={props.buttonLabel}
      customTitle={<span>{props.title || "Delete Confirmation"}</span>}
      body={
        <p class="p:10px|0px">
          {props.message || "Are you sure you want to delete this item?"}
        </p>
      }
      footer={(toggle) => (
        <div class={"flex ai:center jc:end"}>
          <button
            class="danger"
            style={{ "margin-right": "7px" }}  
            onClick={() => {
              handleCancel();
              toggle((v) => !v);
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              handleConfirm();
              toggle((v) => !v);
            }}
            style="margin-right: 10px;"
          >
            Confirm
          </button>
        </div>
      )}
      dialogClass="min-w:20% r:10px p:0"
    />
  );
}
