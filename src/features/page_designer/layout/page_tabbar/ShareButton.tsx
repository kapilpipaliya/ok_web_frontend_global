import { createSignal } from "solid-js";

import { CustomModal } from "~/components/styled/CustomModal";
import { IconButton } from "~/components/styled/IconButton";
import {
  headerIconButtonClass,
  SETTINGS_CONSTANTS,
} from "~/pages/settings/constants";

import { PageShare } from "./PageShare";

export function ShareButton(props: { formStoreId: string }) {
  const [openDialog, setOpenDialog] = createSignal(false);
  return (
    <>
      <IconButton
        class={headerIconButtonClass}
        icon="ph:share-network"
        onClick={() => setOpenDialog(true)}
        title="Share"
        tooltipGroup="page-buttons"
      />
      <CustomModal
        dialogClass=""
        footer={(toggle) => (
          <div class="flex ai:center jc:flex-end p:10">
            <button
              class={SETTINGS_CONSTANTS.MODAL.BUTTONS.CANCEL_CLASS}
              onClick={() => toggle(false)}
              type="button"
            >
              Close
            </button>
          </div>
        )}
        open={openDialog}
        setOpen={setOpenDialog}
        title={"Code"}
      >
        <PageShare formStoreId={props.formStoreId} />
      </CustomModal>
    </>
  );
}
