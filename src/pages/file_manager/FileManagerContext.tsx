import { type JSX, createContext, useContext } from 'solid-js';
import { createStore } from 'solid-js/store';

import type { Vertex } from '~/lib/graph/graph';

const getInitialFileManagerStore = () => {
  return {
    expandedKeys: [] as string[],
    root: null as Vertex | null,
    selectedItem: null as Vertex | null,
    treeItemHoverId: null as null | string,
  };
};

export type FileManagerObject = ReturnType<typeof getInitialFileManagerStore>;
type FileManagerStore = ReturnType<typeof createStore<FileManagerObject>>;
export const FileManagerStoreContext = createContext<FileManagerStore>();

export function FileManagerStoreProvider(props: { children: JSX.Element }) {
  const fileManagerStore = createStore(getInitialFileManagerStore());

  return (
    <FileManagerStoreContext.Provider value={fileManagerStore}>
      {props.children}
    </FileManagerStoreContext.Provider>
  );
}

export function useFileManagerStore() {
  return useContext(FileManagerStoreContext)!;
}
