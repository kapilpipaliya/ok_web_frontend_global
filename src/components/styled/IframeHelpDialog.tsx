import { createSignal, Show } from "solid-js";

import { CustomModal } from "~/components/styled/CustomModal";
import { IconButton } from "~/components/styled/IconButton";

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
            <div class="flex ai:center jc:center mt:auto">
              <div class="b:1.5px|solid|lightseagreen ml:auto r:5">
                <button class="" onClick={() => setOpen(false)} type="button">
                  Close
                </button>
              </div>
            </div>
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
