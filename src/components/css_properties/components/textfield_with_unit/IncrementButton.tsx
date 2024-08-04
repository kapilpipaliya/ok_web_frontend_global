

import { createSignal } from "solid-js";

import type { Vertex } from "~/lib/graph/graph";

import { CustomModal } from "~/components/CustomModal";
import { IconButton } from "~/components/IconButton";
import FileManager from "~/pages/file_manager/FileManager";

export function IncrementButton(props: Readonly<{ downIncrement: (event: MouseEvent) => void; }>) {
  return (
    <IconButton
      class="bg:transparent border:none cursor:ns-resize"
      icon={"gg:scroll-v"}
      onMouseDown={props.downIncrement}
      size={16}
    />
  );
}


export function FilePickerButton(props: Readonly<{ downIncrement?: (event: MouseEvent) => void; }>) {
  const [openDialog, setOpenDialog] = createSignal(false);
  const [selectedFile, setSelectedFile] = createSignal<Vertex | null>(null);
  const onFileSelected = (file: Vertex) => {
    setSelectedFile(file);
    // TODO:
    // make a edge name and insert edge.
    // if $1 not exit in text add url($1)
    // display icon in different color if file is selected.
    // Add support to select file in Data Grid.
    setOpenDialog(false);
  };
  return (
    <>
    <IconButton
      class=""
      icon={"solar:gallery-linear"}
      onClick={() => setOpenDialog(true)}
      size={16}
    />
    <CustomModal
        dialogClass="w:90vw r:10px p:0 h:90vh flex flex:column"
        footer={() => (
          <div class="flex ai:center jc:center mt:auto">
            <div class="b:1.5px|solid|lightseagreen ml:auto r:5">
             <button
              class=""
              onClick={() => setOpenDialog(false)}
              type="button"
             >Select</button>
            </div>
          </div>
        )}
        open={openDialog}
        setOpen={setOpenDialog}
        title="File Manager"
      >
        <div>
          <FileManager onFileSelected={onFileSelected} />
        </div>
      </CustomModal>



    </>
  );
}
