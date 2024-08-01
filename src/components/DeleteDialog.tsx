import { autofocus } from "@solid-primitives/autofocus";
import { type Accessor, Show, } from "solid-js";
// prevents from being tree-shaken by TS
// eslint-disable-next-line @typescript-eslint/no-unused-expressions
autofocus

import { CustomModal } from "./CustomModal";

export function DialogWithButtons(
  props: Readonly<{
    hasPermission?: boolean;
    message?: string;
    onCancel?: () => void;
    onConfirm: () => void;
    open?: Accessor<boolean>;
    setOpen?: (open: boolean) => void;
    title?: string;
  }>,
) {
  const handleConfirm = () => {
    if (props.hasPermission ?? true) {
      props.onConfirm();
    }
  };

  return (
    <CustomModal
      customTitle={<span>{props.title}</span>}
      dialogClass="min-w:20% r:10px p:0"
      footer={() => (
        <div class="flex ai:center jc:end">
          <button
            autofocus
            class="danger mr:7px"
            onClick={props.onCancel}
            type="button"
            use:autofocus
          >
            Cancel
          </button>
          <Show when={props.hasPermission ?? true}>
            <button
              class="mr:10px"
              onClick={handleConfirm}
              type="button"
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
          <p class="color:gray-50 p:10px|0px">
            You do not have permission to perform the action.
          </p>
        }
        when={props.hasPermission ?? true}
      >
        <p class="p:10px|0px">
          {props.message}
        </p>
      </Show>
    </CustomModal>
  );
}