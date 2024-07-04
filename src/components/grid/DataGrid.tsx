import type { ColumnDef } from "@tanstack/solid-table";

import { useNavigate } from "@solidjs/router";
import {
  Match,
  Show,
  Switch,
  createSignal,
  onMount,
  useContext,
} from "solid-js";
import { createStore } from "solid-js/store";

import type { IFormMetaData } from "~/lib/FormMetadataType";

import { DeleteDialog } from "~/components/DeleteDialog";
import { LoaderNew } from "~/components/LoaderSimple";
import { CommonTable } from "~/components/Table";
import { useToast } from "~/components/Toast";
import { PageContext } from "~/lib/contexts";
import { type EdgeMap, GraphContext, type Id, type Vertex, type VertexMap, } from "~/lib/graph/graph";
import { setGraphData } from "~/lib/websocket/setGraphData";

import { AddNewButton } from "./AddNew";
import { Search } from "./Search";
import { deleteRowConfirm } from "./deleteRowConfirm";
import { getTableData } from "./getTableData";
import { setGridHeaders } from "./setGridHeaders";

interface DataGridProps {
  tableId: string;
}
export function DataGrid(props: Readonly<DataGridProps>) {
  const [graph, setGraph] = useContext(GraphContext)!;
  const navigate = useNavigate();
  const { events } = useContext(PageContext);
  const { showErrorToast, showLoadingToast } = useToast();
  const [deleteRowId, setDeleteRowId] = createSignal<Id | null>(null);
  const [tableStore, setTableStore] = createStore({
    data: [],
    tableColumns: [],
  } as { data: any[]; tableColumns: ColumnDef<any>[] });
  const [isSearching, setIsSearching] = createSignal(false);
  const [isShowLoadMore, setIsShowLoadMore] = createSignal(true);

  if (!props.tableId) {
    return <>Incorrect Configuration</>;
  }

  type TableData = {
    error?: string;
    form?: IFormMetaData;
    graph?: {
      edges: EdgeMap;
      vertexes: VertexMap;
    };
    result?: any;
  };
  const [error, setError] = createSignal<null | string>(null);

  // createdResource caled Two times, making API Calles two times, so used onMount
  const [isLoading, setIsLoading] = createSignal(false);
  onMount(async () => {
    setIsLoading(true);
    const data = await getTableData(props.tableId);
    if (data.error) {
      setError(data.error);
    } else {
      onTableDataGet(data);
    }
    setIsLoading(false);
  })

  const [search, setSearch] = createSignal("");
  const [filteredData, setFilteredData] = createSignal([]);

  const handleSearch = (value: string) => {
    setSearch(value);
    if (value && value.length > 0) {
      setIsSearching(true);

      const filtered = tableStore.data.filter(
        (item: Vertex) =>
          Object.values(item.P).some((prop: any) =>
            prop?.toString().toLowerCase().includes(value.toLowerCase())
          ),
      );
      setFilteredData(filtered);
    } else {
      setIsSearching(false);
      setFilteredData(tableStore.data);
    }
  };

  function onTableDataGet(data: TableData) {
      const vertexCount = Object.keys(data.graph!.vertexes).length;
      if (vertexCount < 10 || vertexCount === 0) {
        setIsShowLoadMore(false);
      } else {
        setIsShowLoadMore(true);
      }
      setGraphData(graph, setGraph, data.graph!);
      const resultData = Object.values(data.graph!.vertexes as Vertex[]).filter(
        (v) => v.L[0] === props.tableId
      );
      const nodes: any = tableStore.data
        ? [...tableStore.data, ...resultData]
        : resultData;
      events?.setTitle(data.form!.title);
      const tableColumns = setGridHeaders(data.form!, graph, setGraph, setDeleteRowId, navigate, props.tableId);
      setTableStore({ data: nodes, tableColumns });
      setSearch("");
      setFilteredData(nodes);
 
  }
  const onDelete  = deleteRowConfirm(deleteRowId()!);

  return (
    <Switch>
      <Match when={isLoading()}>
        <LoaderNew loaderHeight="55vh" />
      </Match>
      <Match when={error()}>Error {error()}</Match>
      <Match when={tableStore.data?.length > 0}>
        <div class="flex ai:center jc:space-between p:5">
          <AddNewButton onClick={() => navigate("new")} />
          <nav class="flex ai:center mb:10">
            <Search setValue={handleSearch} value={search()}/>
          </nav>
        </div>
        <CommonTable
          data={filteredData()}
          defaultRowsPerPage={10}
          headers={tableStore.tableColumns}
          isSearching={isSearching()}
          isShowLoadMore={isShowLoadMore()}
          onLoadMore={(skip, limit) => getTableData(props.tableId, skip, limit)}
          rowsPerPageOptions={[5, 10, 15]}
          totalItems={filteredData().length}
        />
        <Show when={deleteRowId()}>
          <DeleteDialog
            message="Are you sure you want to delete this item?"
            onConfirm={onDelete}
            open={true}
            title="Delete Item"
          />
        </Show>
      </Match>
    </Switch>
  );
}
