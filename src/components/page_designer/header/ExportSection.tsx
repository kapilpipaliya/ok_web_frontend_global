import type { Accessor, Setter } from "solid-js";

import { Icon } from "@iconify-icon/solid";

import { CustomModal } from "~/components/CommonDialog";
import { Tooltip } from "~/components/solid_blocks/tooltip/tooltip";

import { ShareSection } from "./PageShare";

export function ExportSection(props: Readonly<{
  openDialog: Accessor<boolean>;
  setOpenDialog: Setter<boolean>;
}>) {
  return (
    <CustomModal
      body={<ShareSection />}
      buttonLabel={<Tooltip content={"Share"} position={"s"}>
        <div class="b:1px|solid|lightgrey bg:white color:#000:hover color:grey flex ai:center jc:center r:7 h:35px w:37px cursor:pointer">
          <Icon height={22} icon={"basil:share-box-outline"} width={22} />
        </div>
      </Tooltip>}
      dialogClass=""
      footer={(toggle) => (
        <div class="flex ai:center jc:flex-end">
          <button onClick={() => toggle(false)}>Close</button>
        </div>
      )}
      open={props.openDialog()}
      openButton={false}
      setOpen={props.setOpenDialog}
      title={"Code"} />
  );
}
