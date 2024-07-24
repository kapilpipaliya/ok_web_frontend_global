import { createSignal } from "solid-js";

import { Icon } from "@iconify-icon/solid";

import { CustomModal } from "~/components/CommonDialog";

import { ShareSection } from "./PageShare";
import { IconButton } from "~/components/IconButton";

export function ExportSection() {
  const [openDialog, setOpenDialog] = createSignal(false);
  return (
    <CustomModal
      body={<ShareSection />}
      buttonLabel={

          <IconButton class="b:1px|solid|lightgrey bg:white color:grey color:#000:hover cursor:pointer jc:center p:6 r:7" title="Share" icon="basil:share-box-outline" />
      
      }
      dialogClass=""
      footer={(toggle) => (
        <div class="flex ai:center jc:flex-end">
          <button onClick={() => toggle(false)}>Close</button>
        </div>
      )}
      open={openDialog}
      openButton={false}
      setOpen={setOpenDialog}
      title={"Code"}
    />
  );
}
