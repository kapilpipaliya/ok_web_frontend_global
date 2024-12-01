import { createSignal, Show } from "solid-js";

import { CustomModal } from "~/components/styled/CustomModal";
import { IconButton } from "~/components/styled/IconButton";


export function IconPicker() {
  const [open, setOpen] = createSignal(false);

  const handleIconClick = () => {
    setOpen(true);
  };

  return (
    <>
      <IconButton
        icon="arcticons:pickme"
        onClick={handleIconClick}
        size={24} />
      <Show when={open()}>
        <CustomModal
          bodyClass="h:100%"
          dialogClass="w:90vw r:10px p:0 h:90vh flex flex:column"
          footer={() => (
            <div class="flex ai:center jc:center mt:auto">
              <div class="b:1.5px|solid|lightseagreen ml:auto r:5">
                <button
                  class=""
                  onClick={() => setOpen(false)}
                  type="button"
                >
                  Close
                </button>
              </div>
            </div>
          )}
          isCloseOnOutsideClick={true}
          open={open}
          setOpen={setOpen}
          title="Icon Picker"
        >
          <iframe
            allow="clipboard-write"
            class="h:full w:full"
            src="https://icon-sets.iconify.design"
            title="Icon Sets" />
        </CustomModal>
      </Show>
    </>
  );
}
