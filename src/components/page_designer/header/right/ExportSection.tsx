import { createSignal } from "solid-js";

import { CustomModal } from "~/components/CustomModal";
import { IconButton } from "~/components/IconButton";

import { ShareSection } from "./PageShare";

export function ExportSection() {
  const [openDialog, setOpenDialog] = createSignal(false);
  return (
    <>
    <IconButton class="b:1px|solid|lightgrey bg:white color:grey color:#000:hover cursor:pointer jc:center p:6 r:7" icon="basil:share-box-outline" onClick={() => setOpenDialog(true)} title="Share" />
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
    </CustomModal></>
  );
}
