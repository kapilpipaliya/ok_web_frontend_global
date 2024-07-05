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
        <div class="flex ai:center b:1px|solid|lightgrey bg:white color:grey color:#000:hover cursor:pointer h:35px jc:center r:7 w:37px">
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
