import { ColumnDef } from "@tanstack/solid-table";
import { JSX, createContext, useContext } from "solid-js";
import { createStore } from "solid-js/store";

import { GraphInterface, Id, Vertex } from "~/lib/graph/graph";

export function getInitialGridState(graph: GraphInterface) {
  return {
    cardSize: graph.vertexes[graph.userSettingId]?.P.cardSize || 3,
    deleteRowId: null as Id | null,
    error: null as null | string,
    filteredData: [] as Vertex[],
    isLoading: false,
    isSearching: false,
    isShowLoadMore: true,
    layout: (graph.vertexes[graph.userSettingId]?.P.layout || 'table') as 'card' | 'table',
    search: '',
    tableStore: {
      data: [] as any[],
      tableColumns: [] as ColumnDef<any>[],
    },
  };
}
export type DataGridState = ReturnType<typeof getInitialGridState>;
type DataGridStore = ReturnType<typeof createStore<DataGridState>>;
export const DataGridStoreContext = createContext<DataGridStore>();


const DataGridContext = createContext<DataGridStore>();

export function DataGridProvider(props: Readonly<{ children: JSX.Element; value: DataGridStore; }>) {
  return (
    <DataGridContext.Provider value={props.value}>
      {props.children}
    </DataGridContext.Provider>
  );
}

export function useDataGridContext() {
  return useContext(DataGridContext)!;
}
