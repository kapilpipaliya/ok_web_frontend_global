import jsep from "jsep";
import { createEffect, createMemo, createSignal, For } from "solid-js";

import { DataGrid } from "~/components/grid/DataGrid";
import { FileUploader } from "~/components/solid_blocks/FileUploader";
import { useToast } from "~/components/Toast";
import { submitDataCall } from "~/lib/api/service/data/submitDataCall";
import { evaluate } from "~/lib/expression_eval";
import { useGraph, type Vertex } from "~/lib/graph/graph";
import { setSelectionValue } from "~/lib/graph/mutate/setSelectionValue";
import { commitTxn } from "~/lib/graph/transaction/commitTxn";
import { parentDirectory } from "~/lib/meta/file/File";

import { useFileManagerStore } from "../FileManagerContext";
import { getFilesData } from "../sidebar/getFilesData";

export function FileManagerMainArea(props: Readonly<{ item: Vertex }>) {
  const [graph, setGraph] = useGraph();
  const [fileManagerStore, setFileManagerStore] = useFileManagerStore();

  const [_children, setChildren] = createSignal<Vertex[]>([]);

  const fetchChildren = async (item: Vertex) => {
    const data = await getFilesData(graph, setGraph, item.id);
    // @ts-expect-error ignore
    if (!data.error && data.result) {
      // @ts-expect-error ignore
      setChildren(data.result);
    }
    return data;
  };

  const breadcrumb =  createMemo(() => {
    const breadcrumbItems: Vertex[] = [];
    let currentItem: null | Vertex = props.item;

    while (currentItem) {
      breadcrumbItems.unshift(currentItem);
      const parentVertex: Vertex[] =
        evaluate(jsep("->ParentFolder"), {
          graph,
          setGraph,
          vertexes: [currentItem],
        }) || [];
      currentItem = parentVertex[0];
    }

    return breadcrumbItems;
  });

  createEffect(() => {
    fetchChildren(props.item);
  });

  function AddNewFileButton() {
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
          : evaluate(jsep("->ParentFolder"), {
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

      const commitData = commitTxn(newFormTxnId, graph);

      if (!commitData) {
        showErrorToast("Failed to upload file");
        return;
      }

      await submitDataCall({ ...commitData }, graph, setGraph, newFormTxnId);
      showSuccessToast("File uploaded successfully");

      fileManagerStore.gridStore?.[0].fetchTableData();
    };
    return (
      <div>
        <FileUploader onUploadSuccess={onUploadSuccess} />
      </div>
    );
  }

  return (
    <div>
      <div class="d:flex gap:2 p:2">
        <For each={breadcrumb()}>
          {(item, index) => (
            <button
              class={`c:blue ${index() === 0 ? "font-weight:600" : ""} cursor:pointer`}
              onClick={() => setFileManagerStore("selectedItem", item)}
              type="button"
            >
              {item.P.name}
              {index() < breadcrumb().length - 1 && " / "}
            </button>
          )}
        </For>
      </div>
      <div>
        <DataGrid
          CustomAddNewButton={AddNewFileButton}
          enableRowSelection={fileManagerStore.enableRowSelection}
          getTableData={() => fetchChildren(props.item)}
          initializeGridStoreParent={(gridStore_) => {
            setFileManagerStore({
              get gridStore() {
                return gridStore_;
              },
            });
          }}
          isShowPagination={false}
          tableId="File"
        />
      </div>
    </div>
  );
}
