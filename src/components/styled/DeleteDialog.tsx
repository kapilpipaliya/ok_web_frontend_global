import { autofocus } from "@solid-primitives/autofocus";
import { type Accessor, Show } from "solid-js";
// prevents from being tree-shaken by TS
// eslint-disable-next-line @typescript-eslint/no-unused-expressions
autofocus;

import { SETTINGS_CONSTANTS } from "~/pages/settings/constants";

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
        <div class={SETTINGS_CONSTANTS.MODAL.FOOTER.CLASS}>
          <Show when={props.hasPermission ?? true}>
            <button
              class={SETTINGS_CONSTANTS.MODAL.BUTTONS.DELETE_CLASS}
              onClick={handleConfirm}
              type="button"
            >
              Confirm
            </button>
          </Show>
          <button
            autofocus
            class={SETTINGS_CONSTANTS.MODAL.BUTTONS.CANCEL_CLASS}
            onClick={props.onCancel}
            type="button"
            use:autofocus
          >
            Cancel
          </button>
        </div>
      )}
      open={props.open}
      setOpen={props.setOpen}
    >
      <Show
        fallback={
          <p class={SETTINGS_CONSTANTS.MODAL.BODY.CLASS}>
            You do not have permission to perform the action.
          </p>
        }
        when={props.hasPermission ?? true}
      >
        <p class={SETTINGS_CONSTANTS.MODAL.BODY.CLASS}>{props.message}</p>
      </Show>
    </CustomModal>
  );
}
