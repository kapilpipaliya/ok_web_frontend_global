import { useNavigate } from "@solidjs/router";
import { type Accessor, Match, Show, Switch, createEffect, createMemo, createSignal, on, onMount } from "solid-js";
import { createStore } from "solid-js/store";

import type { ServerResult } from "~/cypher/types/ServerResult";
import type { IFormMetaData } from "~/lib/meta/FormMetadataType";

import { DeleteDialog } from "~/components/DeleteDialog";
import { LoaderNew } from "~/components/LoaderSimple";
import { CommonTable } from "~/components/Table";
import { fetchDataFromMG } from "~/cypher/get/fetchDataFromMG";
import { isValidResponse } from "~/lib/api/isValidResponse";
import { isObject } from "~/lib/data_structure/object/isObject";
import { getEdgesFromRowsAttr } from "~/lib/graph/get/sync/getEdgesFromRowsAttr";
import { type Vertex, useGraph } from "~/lib/graph/graph";
import { setGraphData } from "~/lib/graph/mutate/setGraphData";
import { FormMetaData } from "~/lib/meta/formMetaData";
import { FormMetaDataAuth } from "~/lib/meta/formMetaDataAuth";

import { getConfiguredPermissions, hasPermissions } from "../page_attr_render/permissions";
import { generateFormMetaAttributes } from "../page_designer/functions/getChildrenAttrs";
import { DataGridProvider, type DataGridState, getInitialGridState } from "./DataGridContext";
import { GridHeader } from "./GridHeader";
import { setGridHeaders } from "./SetGridHeaders";
import { getTableData } from "./functions/getTableData";
import { useDeleteRowConfirm } from "./functions/useDeleteRowConfirm";

interface DataGridProps {
  tableId: string;
}

export function DataGrid(props: Readonly<DataGridProps>) {
  const [graph, setGraph] = useGraph();
  const navigate = useNavigate();

  const [gridState, setGridState] = createStore<DataGridState>(getInitialGridState(graph));
  const [formMetaData, setFormMetaData] = createSignal<IFormMetaData | null>(null);

  const allConfiguredPermission = createMemo(() => getConfiguredPermissions(graph.userRoles, gridState.metaVertex?.id, graph, setGraph));
  const hasInsertPermission = createMemo(() => formMetaData() && hasPermissions(allConfiguredPermission(), 'insert', graph, setGraph));
  const hasEditPermission = createMemo(() => formMetaData() && hasPermissions(allConfiguredPermission(), 'edit', graph, setGraph));
  const hasDeletePermission = createMemo(() => formMetaData() && hasPermissions(allConfiguredPermission(), 'delete', graph, setGraph));
  const hasViewPermission = createMemo(() => formMetaData() && hasPermissions(allConfiguredPermission(), 'view', graph, setGraph));

  setGridState({allConfiguredPermission: allConfiguredPermission, formMetaData: formMetaData, hasDeletePermission: hasDeletePermission, hasEditPermission: hasEditPermission, hasInsertPermission: hasInsertPermission, hasViewPermission: hasViewPermission});

  createEffect(on([() => gridState.cardSize, () => gridState.layout], () => {
    graph.saveUserSetting({ cardSize: gridState.cardSize, layout: gridState.layout });
  }, { defer: true }));

  if (!props.tableId) {
    setGridState("error", "No tableId provided");
  }

  const metaDtaInitialize = (data: ServerResult) => {
    setGraphData(graph, setGraph, data.graph);

    if (Array.isArray(data.result)) {
      if (data.result.length > 0) {
        const metaVertex_ = graph.vertexes[data.result[0].id];
        setGridState("metaVertex", metaVertex_);
      }
    } else if (isObject(data.result)) {
      const metaVertex_ = graph.vertexes[data.result.id];
      setGridState("metaVertex", metaVertex_);
    }
  };
  const loadMetaData = async () => {
    let form = FormMetaData[props.tableId] || FormMetaDataAuth[props.tableId];
    if (!form) {
      form = FormMetaData.Form;
      const { incoming, outgoing } = getEdgesFromRowsAttr(form.attributes);
      const data = await fetchDataFromMG({
        expression: `g:'Form[${props.tableId}]'`,
        incoming,
        outgoing,
      });
      if (!data || !isValidResponse(data) || data.error || data.result.length === 0) {
        setGridState("error", `No ${props.tableId} configured`);
        return;
      }
      metaDtaInitialize(data);
    }
    form = gridState.metaVertex ? generateFormMetaAttributes(
      graph,
      setGraph,
      gridState.metaVertex
    ) : FormMetaData[props.tableId] || FormMetaDataAuth[props.tableId];
    setFormMetaData(form);
    
    setGridState("noPermissionCheck", !gridState.metaVertex);
  };

  onMount(async () => {
    setGridState("isLoading", true);
    await loadMetaData();
    const data = await getTableData(formMetaData()!, props.tableId);
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

  function onTableDataGet(data: ServerResult) {
    const vertexCount = Object.keys(data.graph!.vertexes).length;
    setGridState("isShowLoadMore", vertexCount >= 10);
    setGraphData(graph, setGraph, data.graph!);
    const resultData = Object.values(data.graph!.vertexes).filter(
      (v) => v.L[0] === props.tableId,
    );
    const nodes: Vertex[] = gridState.tableStore.data
      ? [...gridState.tableStore.data, ...resultData]
      : resultData;
    graph.events?.setTitle?.(formMetaData()!.title);
    const tableColumns = setGridHeaders(
      gridState,
      formMetaData()!,
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

  const onDelete = useDeleteRowConfirm(gridState);

  return (
    <DataGridProvider value={[gridState, setGridState]}>
      <Switch>
        <Match when={gridState.isLoading}>
          <LoaderNew loaderHeight="55vh" />
        </Match>
        <Match when={gridState.error}>
          <div>Error: {gridState.error}</div>
        </Match>
        <Match when={formMetaData()}>
          <GridHeader
            formMetaData={formMetaData()}
            onSearch={handleSearch}
          />
          <CommonTable
            allConfiguredPermission={allConfiguredPermission()}
            cardSize={gridState.cardSize}
            data={gridState.filteredData}
            defaultRowsPerPage={10}
            headers={gridState.tableStore.tableColumns}
            isSearching={gridState.isSearching}
            isShowLoadMore={gridState.isShowLoadMore}
            layout={gridState.layout}
            onLoadMore={(skip, limit) => getTableData(formMetaData()!, props.tableId, skip, limit)}
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
