import type { RowSelectionOptions } from "@tanstack/solid-table";

import { useParams } from "@solidjs/router";
import { batch, createContext, type JSX, onMount, useContext } from "solid-js";
import { createStore, type SetStoreFunction } from "solid-js/store";

import type { DataGridStore } from "~/components/grid/DataGridContext";

import { type GraphInterface, useGraph, type Vertex } from "~/lib/graph/graph";

import { getFilesData, getRootData } from "./sidebar/getFilesData";

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
    useLocalData: true,
    useSidebarData: true,
  };
};

export type FileManagerObject = ReturnType<typeof getInitialFileManagerStore>;
export type FileManagerStore = ReturnType<
  typeof createStore<FileManagerObject>
>;
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
    let expandedKeys: string[] = [];
    let selectedItem: null | Vertex = null;
    let root: null | Vertex = null;

    if (params.folderId || props.fileId) {
      const rootData = await getRootData(
        graph,
        setGraph,
        params.folderId,
        props.toParentEdgeType,
        props.parentVertexLabel,
        props.fileId,
      );
      if ("result" in rootData && rootData.result.length > 0) {
        const resultData = rootData.result as Vertex[];
        expandedKeys = resultData.map((v) => v.id);
        root = { ...resultData[resultData.length - 1] };

        if (params.folderId) {
          // when folderId is provided, we want to select the same folder
          selectedItem = { ...graph.vertexes[params.folderId] };
        } else {
          selectedItem = { ...resultData[0] };
        }
      }
    } else {
      const rootData = await getRootData(
        graph,
        setGraph,
        props.toParentEdgeType,
        props.parentVertexLabel,
      );
      if ("result" in rootData && rootData.result.length > 0) {
        root = { ...rootData.result[0] };
        expandedKeys = [root.id];
        selectedItem = params.folderId || props.fileId ? null : { ...root };
      }
    }

    await fetchChildrenDataBatch(
      graph,
      setGraph,
      fileManagerStore[0].toParentEdgeType,
      expandedKeys,
    );

    batch(() => {
      fileManagerStore[1]("useLocalData", true);
      if (root) {
        fileManagerStore[1]("root", root);
      }
      fileManagerStore[1]("expandedKeys", expandedKeys);
      if (selectedItem) {
        fileManagerStore[1]("selectedItem", selectedItem);
      }
    });
    fileManagerStore[1]("useLocalData", false);
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

// fetch current children and children of children
export async function fetchChildrenDataBatch(
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  toParentEdgeType: string,
  expandedKeys: string[],
) {
  const data = await getFilesData(
    graph,
    setGraph,
    toParentEdgeType,
    expandedKeys,
  );
  if (
    "result" in data &&
    Array.isArray(data.result) &&
    data.result.length > 0
  ) {
    await getFilesData(
      graph,
      setGraph,
      toParentEdgeType,
      data.result.map((v) => v.id),
    );
  }
}
