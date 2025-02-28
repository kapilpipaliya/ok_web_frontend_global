import { FileUploader } from "~/components/styled/FileUploader";
import { useToast } from "~/components/styled/Toast";
import { evalExpression } from "~/lib/expression_eval";
import { useGraph, type Vertex } from "~/lib/graph/graph";
import { setSelectionValue } from "~/lib/graph/mutate/setSelectionValue";
import { generateNewTxnId } from "~/lib/graph/transaction/generateNewTxnId";
import { parentDirectory } from "~/lib/meta/file/File";

import { handleDataSubmission } from "../../../lib/graph/mutate/handleDataSubmission";
import { useFileManagerStore } from "../FileManagerContext";

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
    const newFormTxnId = generateNewTxnId(graph, setGraph);

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

    const isSuccess = await handleDataSubmission(
      newFormTxnId,
      graph,
      setGraph,
      showErrorToast,
      showSuccessToast,
      {
        errorMessage: "An error occurred while uploading the file",
        successMessage: "File uploaded successfully",
      },
    );
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
