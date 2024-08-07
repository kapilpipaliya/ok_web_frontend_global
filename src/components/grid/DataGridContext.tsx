import type { ColumnDef } from "@tanstack/solid-table";
import type { createStore } from "solid-js/store";

import { type Accessor, createContext, type JSX, useContext } from "solid-js";

import type { ServerResult } from "~/cypher/types/ServerResult";
import type { GraphInterface, Id, Vertex } from "~/lib/graph/graph";
import type { IFormMetaData } from "~/lib/meta/FormMetadataType";

export function getInitialGridState(graph: GraphInterface) {
  return {
    allConfiguredPermission: (() => []) as Accessor<Vertex[]>,
    cardSize: graph.vertexes[graph.userSettingId]?.P.cardSize || 3,
    deleteRowId: null as Id | null,
    error: null as null | string,
    fetchTableData: (() => {}) as (
      skip?: number,
      limit?: number,
      isLoadMore?: boolean,
    ) => Promise<
      | {
          error: string;
        }
      | ServerResult
    >,
    filteredData: [] as Vertex[],
    formId: null as Id | null,
    formMetaData: (() => null) as Accessor<IFormMetaData | null>,
    hasDeletePermission: (() => false) as Accessor<boolean | null | undefined>,
    hasEditPermission: (() => false) as Accessor<boolean | null | undefined>,
    hasInsertPermission: (() => false) as Accessor<boolean | null | undefined>,
    hasViewPermission: (() => false) as Accessor<boolean | null | undefined>,
    isLoading: false,
    isNoPermissionCheck: false,
    isSearching: false,
    isShowLoadMore: true,
    layout: (graph.vertexes[graph.userSettingId]?.P.layout || "table") as
      | "card"
      | "table",
    metaVertex: null as null | Vertex,
    search: "",
    selectedRows: [] as Vertex[],
    tableId: null as null | string,
    tableStore: {
      data: [] as any[],
      tableColumns: [] as ColumnDef<any>[],
    },
  };
}
export type DataGridState = ReturnType<typeof getInitialGridState>;
export type DataGridStore = ReturnType<typeof createStore<DataGridState>>;
export const DataGridStoreContext = createContext<DataGridStore>();

const DataGridContext = createContext<DataGridStore>();

export function DataGridProvider(
  props: Readonly<{ children: JSX.Element; value: DataGridStore }>,
) {
  return (
    <DataGridContext.Provider value={props.value}>
      {props.children}
    </DataGridContext.Provider>
  );
}

export function useDataGridContext() {
  return useContext(DataGridContext)!;
}
