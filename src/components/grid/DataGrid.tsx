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
import { DataGridProvider, DataGridState, getInitialGridState } from "./DataGridContext";

interface DataGridProps {
  tableId: string;
}

export function DataGrid(props: Readonly<DataGridProps>) {
  const [graph, setGraph] = useGraph();
  const navigate = useNavigate();

  const [gridState, setGridState] = createStore<DataGridState>(getInitialGridState(graph));

  createEffect(on([() => gridState.cardSize, () => gridState.layout], () => {
    graph.saveUserSetting({ cardSize: gridState.cardSize, layout: gridState.layout });
  }, { defer: true }));

  if (!props.tableId) {
    return <>Incorrect Configuration</>;
  }

  onMount(async () => {
    setGridState("isLoading", true);
    const data = await getTableData(props.tableId);
    if (data.error) {
      setGridState("error", data.error);
    } else {
      onTableDataGet(data);
    }
    setGridState("isLoading", false);
  });

  const handleSearch = (value: string) => {
    setGridState("search", value);
    if (value && value.length > 0) {
      setGridState("isSearching", true);
      const filtered = gridState.tableStore.data.filter((item: Vertex) =>
        Object.values(item.P).some((prop: any) =>
          prop?.toString().toLowerCase().includes(value.toLowerCase()),
        ),
      );
      setGridState("filteredData", filtered);
    } else {
      setGridState("isSearching", false);
      setGridState("filteredData", gridState.tableStore.data);
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
    setGridState("isShowLoadMore", vertexCount >= 10);
    setGraphData(graph, setGraph, data.graph!);
    const resultData = Object.values(data.graph!.vertexes).filter(
      (v) => v.L[0] === props.tableId,
    );
    const nodes: Vertex[] = gridState.tableStore.data
      ? [...gridState.tableStore.data, ...resultData]
      : resultData;
    graph.events?.setTitle?.(data.form!.title);
    const tableColumns = setGridHeaders(
      data.form!,
      graph,
      setGraph,
      (id) => setGridState("deleteRowId", id),
      navigate,
      props.tableId,
    );
    setGridState("tableStore", { data: nodes, tableColumns });
    setGridState("search", "");
    setGridState("filteredData", nodes);
  }

  const onDelete = useDeleteRowConfirm(() => gridState.deleteRowId);

  return (
    <DataGridProvider value={[gridState, setGridState]}>
      <Switch>
        <Match when={gridState.isLoading}>
          <LoaderNew loaderHeight="55vh" />
        </Match>
        <Match when={gridState.error}>
          <div>Error: {gridState.error}</div>
        </Match>
        <Match when={true}>
          <GridHeader
            onSearch={handleSearch}
          />
          <CommonTable
            cardSize={gridState.cardSize}
            data={gridState.filteredData}
            defaultRowsPerPage={10}
            headers={gridState.tableStore.tableColumns}
            isSearching={gridState.isSearching}
            isShowLoadMore={gridState.isShowLoadMore}
            layout={gridState.layout}
            onLoadMore={(skip, limit) => getTableData(props.tableId, skip, limit)}
            rowsPerPageOptions={[5, 10, 15]}
            totalItems={gridState.filteredData.length}
          />
          <Show when={gridState.deleteRowId}>
            <DeleteDialog
              message="Are you sure you want to delete this item?"
              onCancel={() => setGridState("deleteRowId", null)}
              onConfirm={onDelete}
              open={(() => gridState.deleteRowId) as unknown as Accessor<boolean>}
              setOpen={() => setGridState("deleteRowId", null)}
              title="Delete Item"
            />
          </Show>
        </Match>
      </Switch>
    </DataGridProvider>
  );
}
