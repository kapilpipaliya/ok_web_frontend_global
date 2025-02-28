import type { Accessor } from "solid-js";

import type { FileManagerObject } from "~/features/file_manager/FileManagerContext";
import type { Vertex } from "~/lib/graph/graph";

import { CustomModal } from "~/components/styled/CustomModal";
import { DialogFooter } from "~/components/styled/dialog/DialogFooter";
import FileManager from "~/features/file_manager/FileManager";
import { SETTINGS_CONSTANTS } from "~/pages/settings/constants";

export function FilePickerModal(props: {
  onFileSelected: (selectedFile: Vertex) => void;
  open: Accessor<boolean>;
  selectedFileVertex: Vertex[];
  setFileManagerStore: (fileManagerStore: FileManagerObject) => void;
  setOpen: (open: boolean) => void;
}) {
  return (
    <CustomModal
      dialogClass="w:90vw r:10px p:0 h:90vh flex flex:column"
      footer={() => (
        <DialogFooter
          buttonText="Select"
          class={`${SETTINGS_CONSTANTS.MODAL.BUTTONS.SAVE_CLASS} ml:auto mr:8`}
          containerClass="mt:auto"
          onClick={() => {
            return props.onFileSelected(props.selectedFileVertex[0]);
          }}
          type="button"
        />
      )}
      isCloseOnOutsideClick={false}
      open={props.open}
      setOpen={props.setOpen}
      title="File Manager"
    >
      <div>
        <FileManager
          enableRowSelection={(vertex) =>
            (vertex as unknown as Vertex).L[0] === "File"
          }
          fileId={props.selectedFileVertex[0]?.id}
          parentVertexLabel="Folder"
          setFileManagerStore={props.setFileManagerStore}
          toParentEdgeType="ParentFolder"
        />
      </div>
    </CustomModal>
  );
}
