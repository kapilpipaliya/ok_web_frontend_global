import { FileUploader } from "~/components/solid_blocks/FileUploader";
import { useToast } from "~/components/styled/Toast";
import { evalExpression } from "~/lib/expression_eval";
import { useGraph, type Vertex } from "~/lib/graph/graph";
import { setSelectionValue } from "~/lib/graph/mutate/setSelectionValue";
import { commitTxn } from "~/lib/graph/transaction/commitTxn";
import { parentDirectory } from "~/lib/meta/file/File";

import { useFileManagerStore } from "../FileManagerContext";
import { handleDataSubmission } from "../../../lib/graph/mutate/handleDataSubmission";
export function AddNewFileButton() {
  const [graph, setGraph] = useGraph();
  const [fileManagerStore] = useFileManagerStore();
  const { showErrorToast, showSuccessToast } = useToast();

  const onUploadSuccess = async (data: any) => {
    const currentItem = fileManagerStore.selectedItem;
    if (!currentItem) {
      return;
    }
    const folder: Vertex =
      currentItem.L[0] === "Folder"
        ? currentItem
        : evalExpression("->ParentFolder", {
            graph,
            setGraph,
            vertexes: [currentItem],
          })[0];
    const newFormTxnId = graph.newTxnId;

    const parentFolderMetaVertex = {
      id: "",
      IN: {},
      L: [],
      OUT: {},
      P: parentDirectory,
    } as Vertex;

    setSelectionValue(
      newFormTxnId,
      data.result[0],
      graph,
      setGraph,
      parentFolderMetaVertex,
      folder.id,
    );

      const isSuccess = await handleDataSubmission(newFormTxnId, graph, setGraph, showErrorToast, showSuccessToast, {
        successMessage: "File uploaded successfully",
        errorMessage: "An error occurred while uploading the file",
      });
    if (isSuccess) {
      fileManagerStore.gridStore?.[0].fetchTableData();
    }
  };

  return (
    <div>
      <FileUploader onUploadSuccess={onUploadSuccess} />
    </div>
  );
}
