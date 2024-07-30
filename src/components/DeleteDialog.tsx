import { autofocus } from "@solid-primitives/autofocus";
import { type Accessor, Show, } from "solid-js";
// prevents from being tree-shaken by TS
// eslint-disable-next-line @typescript-eslint/no-unused-expressions
autofocus

import { CustomModal } from "./CustomModal";

export function DeleteDialog(
  props: Readonly<{
    hasDeletePermission?: boolean;
    message?: string;
    onCancel?: () => void;
    onConfirm: () => void;
    open?: Accessor<boolean>;
    setOpen?: (open: boolean) => void;
    title?: string;
  }>,
) {
  const handleConfirm = () => {
    if (props.hasDeletePermission) {
      props.onConfirm();
    }
  };

  return (
    <CustomModal
      customTitle={<span>{props.title || "Delete Confirmation"}</span>}
      dialogClass="min-w:20% r:10px p:0"
      footer={() => (
        <div class="flex ai:center jc:end">
          <button
            autofocus
            class="danger mr:7px"
            onClick={props.onCancel}
            use:autofocus
          >
            Cancel
          </button>
          <Show when={props.hasDeletePermission}>
            <button
              class="mr:10px"
              onClick={handleConfirm}
            >
              Confirm
            </button>
          </Show>
        </div>
      )}
      open={props.open}
      setOpen={props.setOpen}
    >
      <Show
        fallback={
          <p class="color:-gray-50 p:10px|0px">
            You do not have permission to delete the row.
          </p>
        }
        when={props.hasDeletePermission}
      >
        <p class="p:10px|0px">
          {props.message || "Are you sure you want to delete this item?"}
        </p>
      </Show>
    </CustomModal>
  );
}