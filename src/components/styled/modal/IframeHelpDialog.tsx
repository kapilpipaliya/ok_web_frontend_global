import { createSignal, Show } from "solid-js";

import { DialogFooter } from "~/components/styled/dialog/DialogFooter";
import { IconButton } from "~/components/styled/IconButton";
import { CustomModal } from "~/components/styled/modal/CustomModal";
import { SETTINGS_CONSTANTS } from "~/pages/settings/constants";

interface IframeHelpDialogProps {
  icon?: string;
  iconSize?: number;
  iframeSrc?: string;
  iframeTitle?: string;
  title?: string;
}

export function IframeHelpDialog(props: IframeHelpDialogProps) {
  const [open, setOpen] = createSignal(false);

  const handleIconClick = () => {
    setOpen(true);
  };

  return (
    <>
      <IconButton
        icon={props.icon}
        onClick={handleIconClick}
        size={props.iconSize || 24}
      />
      <Show when={open()}>
        <CustomModal
          bodyClass="h:100%"
          dialogClass="w:90vw r:10px p:0 h:90vh flex flex:column"
          footer={() => (
            <DialogFooter
              buttonText="Close"
              class={`${SETTINGS_CONSTANTS.MODAL.BUTTONS.CANCEL_CLASS} ml:auto mr:8 mt:4`}
              containerClass="mt:auto"
              onClick={() => {
                setOpen(false);
              }}
              type="button"
            />
          )}
          isCloseOnOutsideClick={true}
          open={open}
          setOpen={setOpen}
          title={props.title}
        >
          <iframe
            allow="clipboard-write"
            class="h:full w:full"
            src={props.iframeSrc}
            title={props.iframeTitle}
          />
        </CustomModal>
      </Show>
    </>
  );
}
