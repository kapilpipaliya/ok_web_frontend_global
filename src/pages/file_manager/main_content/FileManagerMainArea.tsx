import jsep from "jsep";
import { For, createEffect, createSignal } from "solid-js";

import { DataGrid } from "~/components/grid/DataGrid";
import { evaluate } from "~/lib/expression_eval";
import { type Vertex, useGraph } from "~/lib/graph/graph";

import { useFileManagerStore } from "../FileManagerContext";
import { getFilesData } from "../sidebar/getFilesData";
import { AddNewFileButton } from "./AddNewFileButton";

export function FileManagerMainArea(props: Readonly<{ item: Vertex; }>) {
  const [graph, setGraph] = useGraph();
  const [fileManagerStore, setFileManagerStore] = useFileManagerStore();

  const [children, setChildren] = createSignal<Vertex[]>([]);
  const [breadcrumb, setBreadcrumb] = createSignal<Vertex[]>([]);

  const fetchChildren = async (item: Vertex) => {
    const data = await getFilesData(graph, setGraph, item.id);
    // @ts-expect-error ignore
    if (!data.error && data.result) {
      // @ts-expect-error ignore
      setChildren(data.result);
    }
    return data;
  };

  const fetchBreadcrumb = async (item: Vertex) => {
    const breadcrumbItems: Vertex[] = [];
    let currentItem: Vertex | null = item;

    while (currentItem) {
      breadcrumbItems.unshift(currentItem);
      const parentVertex: Vertex[] = evaluate(jsep(`->ParentFolder`), { graph, setGraph, vertexes: [currentItem] }) || [];
      currentItem = parentVertex[0];
    }

    setBreadcrumb(breadcrumbItems);
  };

  createEffect(() => {
    console.log('props.item');
    fetchChildren(props.item);
  });
  createEffect(() => {
    console.log('props.item2');
    fetchBreadcrumb(props.item);
  });

  return (
    <div>
      <div class="d:flex gap:2 p:2">
        <For each={breadcrumb()}>
          {(item, index) => (
            <button
              class={`c:blue ${index() === 0 ? 'font-weight:600' : ''} cursor:pointer`}
              onClick={() => setFileManagerStore('selectedItem', item)}
              type="button"
            >
              {item.P.name}
              {index() < breadcrumb().length - 1 && " / "}
            </button>
          )}
        </For>
      </div>
      <div>
        <DataGrid CustomAddNewButton={AddNewFileButton} enableRowSelection={fileManagerStore.enableRowSelection} getTableData={() => fetchChildren(props.item)} isShowPagination={false} tableId="File" />
      </div>
    </div>
  );
}
