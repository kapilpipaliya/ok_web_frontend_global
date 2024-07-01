
import type { JSX } from "solid-js";

import {CustomModal} from "./CommonDialog";

export function DeleteDialog(props: Readonly<{
  buttonLabel?: JSX.Element;
  message?: string;
  onCancel?: () => void;
  onConfirm: () => void;
  open?: boolean;
  setOpen?: (open: boolean) => void;
  title?: string;
}>) {
  const handleConfirm = () => {
    props.onConfirm();
  };

  const handleCancel = () => {
    props.onCancel ? props.onCancel() : () => {};
  };
  return (
    <CustomModal
      body={
        <p class="p:10px|0px">
          {props.message || "Are you sure you want to delete this item?"}
        </p>
      }
      bodyStyle={{ "max-height": "none", overflow: "auto" }}
      buttonLabel={props.buttonLabel}
      customTitle={<span>{props.title || "Delete Confirmation"}</span>}
      dialogClass="min-w:20% r:10px p:0"
      footer={(toggle) => (
        <div class={"flex ai:center jc:end"}>
          <button
            class="danger"
            onClick={() => {
              handleCancel();
              toggle((v) => !v);
            }}  
            style={{ "margin-right": "7px" }}
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
      open={props.open}
      openButton={false}
      setOpen={props.setOpen}
    />
  );
}
