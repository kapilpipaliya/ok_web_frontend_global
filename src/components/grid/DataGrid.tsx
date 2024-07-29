import type { ColumnDef } from "@tanstack/solid-table";

import { useNavigate } from "@solidjs/router";
import { type Accessor, Match, Show, Switch, createEffect, createSignal, on, onMount } from "solid-js";
import { createStore } from "solid-js/store";

import type { IFormMetaData } from "~/lib/meta/FormMetadataType";

import { DeleteDialog } from "~/components/DeleteDialog";
import { LoaderNew } from "~/components/LoaderSimple";
import { CommonTable } from "~/components/Table";
import { type EdgeMap, type Id, type Vertex, type VertexMap, useGraph } from "~/lib/graph/graph";
import { setGraphData } from "~/lib/graph/mutate/setGraphData";

import { GridHeader } from "./GridHeader";
import { setGridHeaders } from "./SetGridHeaders";
import { getTableData } from "./functions/getTableData";
import { useDeleteRowConfirm } from "./functions/useDeleteRowConfirm";
import { DataGridState } from "./DataGridContext";

interface DataGridProps {
  tableId: string;
}

export function DataGrid(props: Readonly<DataGridProps>) {
  const [graph, setGraph] = useGraph();
  const navigate = useNavigate();

  const [appState, setAppState] = createStore<DataGridState>({
    cardSize: graph.vertexes[graph.userSettingId]?.P.cardSize || 3,
    deleteRowId: null,
    error: null,
    filteredData: [],
    isLoading: false,
    isSearching: false,
    isShowLoadMore: true,
    layout: graph.vertexes[graph.userSettingId]?.P.layout || 'table',
    search: '',
    tableStore: {
      data: [],
      tableColumns: [],
    },
  });

  createEffect(on([() => appState.cardSize, () => appState.layout], () => {
    graph.saveUserSetting({ cardSize: appState.cardSize, layout: appState.layout });
  }, { defer: true }));

  if (!props.tableId) {
    return <>Incorrect Configuration</>;
  }

  onMount(async () => {
    setAppState("isLoading", true);
    const data = await getTableData(props.tableId);
    if (data.error) {
      setAppState("error", data.error);
    } else {
      onTableDataGet(data);
    }
    setAppState("isLoading", false);
  });

  const handleSearch = (value: string) => {
    setAppState("search", value);
    if (value && value.length > 0) {
      setAppState("isSearching", true);
      const filtered = appState.tableStore.data.filter((item: Vertex) =>
        Object.values(item.P).some((prop: any) =>
          prop?.toString().toLowerCase().includes(value.toLowerCase()),
        ),
      );
      setAppState("filteredData", filtered);
    } else {
      setAppState("isSearching", false);
      setAppState("filteredData", appState.tableStore.data);
    }
  };

  type TableData = {
    error?: string;
    form?: IFormMetaData;
    graph?: {
      edges: EdgeMap;
      vertexes: VertexMap;
    };
    result?: any;
  };
  function onTableDataGet(data: TableData) {
    const vertexCount = Object.keys(data.graph!.vertexes).length;
    setAppState("isShowLoadMore", vertexCount >= 10);
    setGraphData(graph, setGraph, data.graph!);
    const resultData = Object.values(data.graph!.vertexes).filter(
      (v) => v.L[0] === props.tableId,
    );
    const nodes: Vertex[] = appState.tableStore.data
      ? [...appState.tableStore.data, ...resultData]
      : resultData;
    graph.events?.setTitle?.(data.form!.title);
    const tableColumns = setGridHeaders(
      data.form!,
      graph,
      setGraph,
      (id) => setAppState("deleteRowId", id),
      navigate,
      props.tableId,
    );
    setAppState("tableStore", { data: nodes, tableColumns });
    setAppState("search", "");
    setAppState("filteredData", nodes);
  }

  const onDelete = useDeleteRowConfirm(() => appState.deleteRowId);

  return (
    <Switch>
      <Match when={appState.isLoading}>
        <LoaderNew loaderHeight="55vh" />
      </Match>
      <Match when={appState.error}>
        <div>Error: {appState.error}</div>
      </Match>
      <Match when={true}>
        <GridHeader
          cardSize={appState.cardSize}
          columns={appState.tableStore.tableColumns}
          layout={appState.layout}
          onSearch={handleSearch}
          searchValue={appState.search}
          setCardSize={(value: number) => setAppState("cardSize", value)}
          setLayout={(value: 'card' | 'table') => setAppState("layout", value)}
        />
        <CommonTable
          cardSize={appState.cardSize}
          data={appState.filteredData}
          defaultRowsPerPage={10}
          headers={appState.tableStore.tableColumns}
          isSearching={appState.isSearching}
          isShowLoadMore={appState.isShowLoadMore}
          layout={appState.layout}
          onLoadMore={(skip, limit) => getTableData(props.tableId, skip, limit)}
          rowsPerPageOptions={[5, 10, 15]}
          totalItems={appState.filteredData.length}
        />
        <Show when={appState.deleteRowId}>
          <DeleteDialog
            message="Are you sure you want to delete this item?"
            onCancel={() => setAppState("deleteRowId", null)}
            onConfirm={onDelete}
            open={(() => appState.deleteRowId) as unknown as Accessor<boolean>}
            setOpen={(id) => setAppState("deleteRowId", id)}
            title="Delete Item"
          />
        </Show>
      </Match>
    </Switch>
  );
}
