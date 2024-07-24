import type { Accessor, } from "solid-js";

import { autofocus } from "@solid-primitives/autofocus";
// prevents from being tree-shaken by TS
// eslint-disable-next-line @typescript-eslint/no-unused-expressions
autofocus

import { CustomModal } from "./CustomModal";

export function DeleteDialog(
  props: Readonly<{
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
      setOpen={props.setOpen}
    >
            <p class="p:10px|0px">
          {props.message || "Are you sure you want to delete this item?"}
        </p>
    </CustomModal>
  );
}
