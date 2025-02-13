import { createEffect, createMemo, createSignal, For } from "solid-js";

import { DataGrid } from "~/components/grid/DataGrid";
import { evalExpression } from "~/lib/expression_eval";
import { useGraph, type Vertex } from "~/lib/graph/graph";

import { useFileManagerStore } from "../FileManagerContext";
import { getFilesData } from "../sidebar/getFilesData";
import { AddNewCompButton } from "./AddNewCompButtton";
import { AddNewFileButton } from "./AddNewFileButton";

export function FileManagerMainArea(props: Readonly<{ item: Vertex }>) {
  const [graph, setGraph] = useGraph();
  const [fileManagerStore, setFileManagerStore] = useFileManagerStore();

  const [_children, setChildren] = createSignal<Vertex[]>([]);

  const fetchChildren = async (item: Vertex) => {
    const data = await getFilesData(
      graph,
      setGraph,
      fileManagerStore.toParentEdgeType,
      item.id,
    );
    // @ts-expect-error ignore
    if (!data.error && data.result) {
      // @ts-expect-error ignore
      setChildren(data.result);
    }
    return data;
  };

  const breadcrumb = createMemo(() => {
    const breadcrumbItems: Vertex[] = [];
    let currentItem: null | Vertex = props.item;

    while (currentItem) {
      breadcrumbItems.unshift(currentItem);
      const parentVertex: Vertex[] =
        evalExpression(`->${fileManagerStore.toParentEdgeType}`, {
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

  return (
    <div>
      <div class="d:flex gap:2 p:2">
        <For each={breadcrumb()}>
          {(item, index) => (
            <button
              class={`c:primary ${index() === 0 ? "font-weight:600" : ""} cursor:pointer`}
              onClick={() => setFileManagerStore("selectedItem", item)}
              type="button"
            >
              {item.P.key}
              {index() < breadcrumb().length - 1 && " / "}
            </button>
          )}
        </For>
      </div>
      <div>
        <DataGrid
          CustomAddNewButton={
            fileManagerStore.parentVertexLabel === "Comp"
              ? AddNewCompButton
              : AddNewFileButton
          }
          enableRowSelection={fileManagerStore.enableRowSelection}
          getTableData={() => fetchChildren(props.item)}
          initializeGridStoreParent={(gridStore_) => {
            setFileManagerStore({
              get gridStore() {
                return gridStore_;
              },
            });
          }}
          isShowPagination={true}
          tableId={
            fileManagerStore.parentVertexLabel === "Folder"
              ? "File"
              : fileManagerStore.parentVertexLabel
          }
        />
      </div>
    </div>
  );
}
