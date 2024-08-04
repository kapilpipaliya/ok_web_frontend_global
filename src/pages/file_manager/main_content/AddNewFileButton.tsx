import jsep from "jsep";

import { useToast } from "~/components/Toast";
import { FileUploader } from "~/components/solid_blocks/FileUploader";
import { submitDataCall } from "~/lib/api/service/data/submitDataCall";
import { evaluate } from "~/lib/expression_eval";
import { type Vertex, useGraph } from "~/lib/graph/graph";
import { setSelectionValue } from "~/lib/graph/mutate/setSelectionValue";
import { commitTxn } from "~/lib/graph/transaction/commitTxn";
import { parentDirectory } from "~/lib/meta/file/File";

import { useFileManagerStore } from "../FileManagerContext";

export function AddNewFileButton(props: { disabled: boolean; onClick: () => void }) {
    const [graph, setGraph] = useGraph();
    const [fileManagerStore, setFileManagerStore] = useFileManagerStore();
    const { showErrorToast, showSuccessToast } = useToast();
  
    const onUploadSuccess = async (data: any) => {
      const currentItem = fileManagerStore.selectedItem;
      if (!currentItem) return;
      const folder: Vertex = currentItem.L[0] === 'Folder' ? currentItem : evaluate(jsep(`->ParentFolder`), { graph, setGraph, vertexes: [currentItem] })[0];
      const newFormTxnId = graph.newTxnId;
  
      const parentFolderMetaVertex = {
        IN: {},
        L: [],
        OUT: {},
        P: parentDirectory,
        id: "",
      } as Vertex;
  
      setSelectionValue(newFormTxnId, data.result[0], graph, setGraph, parentFolderMetaVertex, folder.id);
  
      const commitData = commitTxn(newFormTxnId, graph);
  
      if (!commitData) {
        showErrorToast("Failed to upload file");
        return;
      }
  
      await submitDataCall({ ...commitData }, graph, setGraph, newFormTxnId);
      showSuccessToast("File uploaded successfully");
    }
    return (
      <div>
        <FileUploader onUploadSuccess={onUploadSuccess} />
      </div>
    );
  }