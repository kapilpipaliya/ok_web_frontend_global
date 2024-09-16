import { createSignal } from "solid-js";

import { CustomModal } from "~/components/CustomModal";
import { IconButton } from "~/components/IconButton";

import { ShareSection } from "./PageShare";
import { headerIconButtonClass } from "~/pages/admin_layout/constant";

export function ExportSection() {
  const [openDialog, setOpenDialog] = createSignal(false);
  return (
    <>
      <IconButton
        class={headerIconButtonClass}
        icon="basil:share-box-outline"
        onClick={() => setOpenDialog(true)}
        title="Share"
      />
      <CustomModal
        dialogClass=""
        footer={(toggle) => (
          <div class="flex ai:center jc:flex-end">
            <button onClick={() => toggle(false)}>Close</button>
          </div>
        )}
        open={openDialog}
        setOpen={setOpenDialog}
        title={"Code"}
      >
        <ShareSection />
      </CustomModal>
    </>
  );
}
