import type { RowSelectionOptions } from "@tanstack/solid-table";

import { batch, createContext, type JSX, onMount, useContext } from "solid-js";
import { createStore } from "solid-js/store";

import type { DataGridStore } from "~/components/grid/DataGridContext";
import { useGraph, type Vertex } from "~/lib/graph/graph";
import { getFilesData, getRootData } from "./sidebar/getFilesData";
import { useParams } from "@solidjs/router";
import jsep from "jsep";
import { evaluate } from "~/lib/expression_eval";

const getInitialFileManagerStore = () => {
  return {
    enableRowSelection:
      undefined as RowSelectionOptions<Vertex>["enableRowSelection"],
    expandedKeys: [] as string[],
    gridStore: null as DataGridStore | null,
    root: null as null | Vertex,
    selectedItem: null as null | Vertex,
    treeItemHoverId: null as null | string,
    useSidebarData: true,
  };
};

export type FileManagerObject = ReturnType<typeof getInitialFileManagerStore>;
type FileManagerStore = ReturnType<typeof createStore<FileManagerObject>>;
export const FileManagerStoreContext = createContext<FileManagerStore>();

export function FileManagerStoreProvider(
  props: Readonly<{
    children: JSX.Element;
    enableRowSelection?: RowSelectionOptions<Vertex>["enableRowSelection"];
    fileId?: string;
    onFileSelected?: (file: Vertex) => void;
    setFileManagerStore?: (fileManagerStore: FileManagerObject) => void;
  }>,
) {
  const fileManagerStore = createStore({
    ...getInitialFileManagerStore(),
    get enableRowSelection() {
      return props.enableRowSelection;
    },
  });
  props.setFileManagerStore?.(fileManagerStore[0]);
  const [graph, setGraph] = useGraph();
  const params = useParams();

  onMount(async () => {
    if (params.folderId || props.fileId) {
      const rootData = await getRootData(
        graph,
        setGraph,
        params.folderId,
        props.fileId,
      );
      // @ts-expect-error ignore
      if (!rootData.error && rootData.result.length > 0) {
        batch(() => {
          // @ts-expect-error ignore
          fileManagerStore[1]("expandedKeys", rootData.result.map(v=>v.id));
          // @ts-expect-error ignore
          fileManagerStore[1]("root", { ...rootData.result[rootData.result.length - 1] });
          if (params.folderId) {
            // when folderId is provided, we want to select the same folder
            fileManagerStore[1]("selectedItem", { ...graph.vertexes[params.folderId] });
          } else {
            // @ts-expect-error ignore
            fileManagerStore[1]("selectedItem", { ...rootData.result[0] });
          }
        });
      }

    } else {
      const rootData = await getRootData(graph, setGraph);
      // @ts-expect-error ignore
      if (!rootData.error && rootData.result.length > 0) {
        batch(() => {
          // @ts-expect-error ignore
          fileManagerStore[1]("root", { ...rootData.result[0] });
          // @ts-expect-error ignore
          fileManagerStore[1]("expandedKeys", [rootData.result[0].id]);
          if (!(params.folderId || props.fileId)) {
            // @ts-expect-error ignore
            fileManagerStore[1]("selectedItem", { ...rootData.result[0] });
          }
        });
      }
    }
  });

  return (
    <FileManagerStoreContext.Provider value={fileManagerStore}>
      {props.children}
    </FileManagerStoreContext.Provider>
  );
}

export function useFileManagerStore() {
  return useContext(FileManagerStoreContext)!;
}
