import { ColumnDef } from "@tanstack/solid-table";
import { createContext, useContext } from "solid-js";

import { Id, Vertex } from "~/lib/graph/graph";

export interface DataGridState {
    cardSize: number;
    deleteRowId: Id | null;
    error: null | string;
    filteredData: Vertex[];
    isLoading: boolean;
    isSearching: boolean;
    isShowLoadMore: boolean;
    layout: 'card' | 'table';
    search: string;
    tableStore: {
      data: any[];
      tableColumns: ColumnDef<any>[];
    };
  }

const DataGridContext = createContext<DataGridState>();

export const DataGridProvider = (props) => {
  return (
    <DataGridContext.Provider value={props.value}>
      {props.children}
    </DataGridContext.Provider>
  );
};

export const useDataGridContext = () => {
  return useContext(DataGridContext);
};
