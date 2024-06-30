import { Icon } from "@iconify-icon/solid";
import type { Accessor, Setter } from "solid-js";
import { Tooltip } from "~/components/solid_blocks/tooltip/tooltip";
import { CustomModal } from "~/components/CommonDialog";
import { ShareSection } from "./PageShare";

export function ExportSection(props: Readonly<{
  setOpenDialog: Setter<boolean>;
  openDialog: Accessor<boolean>;
}>) {
  return (
    <CustomModal
      dialogClass=""
      title={"Code"}
      openButton={false}
      buttonLabel={<Tooltip content={"Share"} position={"s"}>
        <div class="b:1px|solid|lightgrey bg:white color:#000:hover color:grey flex ai:center jc:center r:7 h:35px w:37px cursor:pointer">
          <Icon icon={"basil:share-box-outline"} height={22} width={22} />
        </div>
      </Tooltip>}
      body={<ShareSection />}
      footer={(toggle) => (
        <div class="flex ai:center jc:flex-end">
          <button onClick={() => toggle(false)}>Close</button>
        </div>
      )}
      setOpen={props.setOpenDialog}
      open={props.openDialog()} />
  );
}
