import type { Accessor, JSX } from "solid-js";

import { autofocus } from "@solid-primitives/autofocus";
// prevents from being tree-shaken by TS
// eslint-disable-next-line @typescript-eslint/no-unused-expressions
autofocus

import { CustomModal } from "./CommonDialog";

export function DeleteDialog(
  props: Readonly<{
    buttonLabel?: JSX.Element;
    message?: string;
    onCancel?: () => void;
    onConfirm: () => void;
    open?: Accessor<boolean>;
    setOpen?: (open: boolean) => void;
    title?: string;
  }>,
) {
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
      buttonLabel={props.buttonLabel}
      customTitle={<span>{props.title || "Delete Confirmation"}</span>}
      dialogClass="min-w:20% r:10px p:0"
      footer={(toggle) => (
        <div class={"flex ai:center jc:end"}>
          <button
            autofocus
            class="danger mr:7px"
            onClick={() => {
              handleCancel();
            }}
            use:autofocus
          >
            Cancel
          </button>
          <button
            class="mr:10px"
            onClick={() => {
              handleConfirm();
            }}
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
