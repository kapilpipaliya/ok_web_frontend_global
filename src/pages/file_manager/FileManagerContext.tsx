import type { RowSelectionOptions } from "@tanstack/solid-table";

import { useParams } from "@solidjs/router";
import { batch, createContext, type JSX, onMount, useContext } from "solid-js";
import { createStore } from "solid-js/store";

import type { DataGridStore } from "~/components/grid/DataGridContext";

import { useGraph, type Vertex } from "~/lib/graph/graph";

import { getRootData } from "./sidebar/getFilesData";

const getInitialFileManagerStore = () => {
  return {
    enableRowSelection:
      undefined as RowSelectionOptions<Vertex>["enableRowSelection"],
    expandedKeys: [] as string[],
    gridStore: null as DataGridStore | null,
    parentVertexLabel: "Folder",
    root: null as null | Vertex,
    selectedItem: null as null | Vertex,
    toParentEdgeType: "ParentFolder",
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
    parentVertexLabel: string;
    setFileManagerStore?: (fileManagerStore: FileManagerObject) => void;
    toParentEdgeType: string;
  }>,
) {
  const fileManagerStore = createStore({
    ...getInitialFileManagerStore(),
    get enableRowSelection() {
      return props.enableRowSelection;
    },
    get parentVertexLabel() {
      return props.parentVertexLabel;
    },
    get toParentEdgeType() {
      return props.toParentEdgeType;
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
        props.toParentEdgeType,
        props.parentVertexLabel,
        props.fileId,
      );
      // @ts-expect-error ignore
      if (!rootData.error && rootData.result.length > 0) {
        batch(() => {
          const resultData = rootData.result as Vertex[];

          fileManagerStore[1](
            "expandedKeys",
            resultData.map((v) => v.id),
          );

          fileManagerStore[1]("root", {
            ...resultData[resultData.length - 1],
          });
          if (params.folderId) {
            // when folderId is provided, we want to select the same folder
            fileManagerStore[1]("selectedItem", {
              ...graph.vertexes[params.folderId],
            });
          } else {
            fileManagerStore[1]("selectedItem", { ...resultData[0] });
          }
        });
      }
    } else {
      const rootData = await getRootData(
        graph,
        setGraph,
        props.toParentEdgeType,
        props.parentVertexLabel,
      );
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
