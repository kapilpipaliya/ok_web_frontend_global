import { createSignal } from "solid-js";

import { CustomModal } from "~/components/styled/CustomModal";
import { IconButton } from "~/components/styled/IconButton";
import { headerIconButtonClass } from "~/pages/constants/constant";

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
        <PageShare formStoreId={props.formStoreId} />
      </CustomModal>
    </>
  );
}
