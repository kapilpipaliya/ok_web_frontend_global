import { Accessor } from "solid-js";

import type { Vertex } from "~/lib/graph/graph";
import type { FileManagerObject } from "~/pages/file_manager/FileManagerContext";

import { CustomModal } from "~/components/styled/CustomModal";
import FileManager from "~/pages/file_manager/FileManager";

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
        <div class="flex ai:center jc:center mt:auto">
          <div class="b:1.5px|solid|lightseagreen ml:auto r:5">
            <button
              class=""
              onClick={() => props.onFileSelected(props.selectedFileVertex[0])}
              type="button"
            >
              Select
            </button>
          </div>
        </div>
      )}
      isCloseOnOutsideClick={false}
      open={props.open}
      setOpen={props.setOpen}
      title="File Manager"
    >
      <div>
        <FileManager
          enableRowSelection={(vertex) => (vertex as unknown as Vertex).L[0] === "File"}
          fileId={props.selectedFileVertex[0]?.id}
          parentVertexLabel="Folder"
          setFileManagerStore={props.setFileManagerStore}
          toParentEdgeType="ParentFolder" />
      </div>
    </CustomModal>
  );
}
