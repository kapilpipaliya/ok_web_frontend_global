import type { RowSelectionOptions } from '@tanstack/solid-table';

import { createContext, type JSX, useContext } from 'solid-js';
import { createStore } from 'solid-js/store';

import type { DataGridStore } from '~/components/grid/DataGridContext';
import type { Vertex } from '~/lib/graph/graph';

const getInitialFileManagerStore = () => {
  return {
    enableRowSelection: undefined as RowSelectionOptions<Vertex>['enableRowSelection'],
    expandedKeys: [] as string[],
    gridStore: null as DataGridStore | null,
    root: null as null | Vertex,
    selectedItem: null as null | Vertex,
    treeItemHoverId: null as null | string
  };
};

export type FileManagerObject = ReturnType<typeof getInitialFileManagerStore>;
type FileManagerStore = ReturnType<typeof createStore<FileManagerObject>>;
export const FileManagerStoreContext = createContext<FileManagerStore>();

export function FileManagerStoreProvider(props: Readonly<{ children: JSX.Element , enableRowSelection?: RowSelectionOptions<Vertex>['enableRowSelection'], onFileSelected?: (file: Vertex) => void, setFileManagerStore?: (fileManagerStore: FileManagerObject) => void }>) {
  const fileManagerStore = createStore({...getInitialFileManagerStore(), get enableRowSelection() { return props.enableRowSelection}});
  props.setFileManagerStore?.(fileManagerStore[0]);
  return (
    <FileManagerStoreContext.Provider value={fileManagerStore}>
      {props.children}
    </FileManagerStoreContext.Provider>
  );
}

export function useFileManagerStore() {
  return useContext(FileManagerStoreContext)!;
}
