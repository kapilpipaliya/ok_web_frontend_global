import type { RowSelectionOptions } from "@tanstack/solid-table";

import { useNavigate } from "@solidjs/router";
import {
  type Accessor,
  createEffect,
  createMemo,
  createSignal,
  type JSX,
  Match,
  on,
  onMount,
  Show,
  Switch,
} from "solid-js";
import { createStore } from "solid-js/store";

import type { ServerResult } from "~/cypher/types/ServerResult";
import type { IFormMetaData } from "~/lib/meta/FormMetadataType";

import { DialogWithButtons } from "~/components/DeleteDialog";
import { LoaderNew } from "~/components/LoaderSimple";
import { CommonTable } from "~/components/Table";
import { fetchDataFromMG } from "~/cypher/get/fetchDataFromMG";
import { getErrorMessage } from "~/lib/api/getErrorMessage";
import { isValidResponse } from "~/lib/api/isValidResponse";
import { isObject } from "~/lib/data_structure/object/isObject";
import { getEdgesFromRowsAttr } from "~/lib/graph/get/sync/getEdgesFromRowsAttr";
import { useGraph, type Vertex } from "~/lib/graph/graph";
import { setGraphData } from "~/lib/graph/mutate/setGraphData";
import { FormMetaData } from "~/lib/meta/formMetaData";

import {
  getConfiguredPermissions,
  hasPermissions,
} from "../page_attr_render/permissions";
import { generateFormMetaAttributes } from "../page_designer/functions/getChildrenAttrs";
import {
  DataGridProvider,
  type DataGridState,
  type DataGridStore,
  getInitialGridState,
} from "./DataGridContext";
import { getTableData as defaultGetTableData } from "./functions/getTableData";
import { useDeleteRowConfirm } from "./functions/useDeleteRowConfirm";
import { GridHeader } from "./GridHeader";
import { setGridHeaders } from "./SetGridHeaders";

interface DataGridProps {
  CustomAddNewButton?: (props: {
    disabled: boolean;
    onClick: () => void;
  }) => JSX.Element;
  enableMultiRowSelection?: RowSelectionOptions<Vertex>["enableMultiRowSelection"];
  enableRowSelection?: RowSelectionOptions<Vertex>["enableRowSelection"];
  getTableData?: typeof defaultGetTableData;
  initializeGridStoreParent?: (formStore: DataGridStore) => void;
  isShowPagination?: boolean;
  tableId: string;
}

export function DataGrid(props: Readonly<DataGridProps>) {
  const [graph, setGraph] = useGraph();
  const navigate = useNavigate();

  const gridStore = createStore<DataGridState>(getInitialGridState(graph));
  const [gridState, setGridState] = gridStore;
  const [formMetaData, setFormMetaData] = createSignal<IFormMetaData | null>(
    null,
  );

  const allConfiguredPermission = createMemo(() =>
    getConfiguredPermissions(
      graph.userRoles,
      gridState.metaVertex,
      graph,
      setGraph,
    ),
  );
  const hasInsertPermission = createMemo(
    () =>
      formMetaData() &&
      hasPermissions(allConfiguredPermission(), "insert", graph, setGraph),
  );
  const hasEditPermission = createMemo(
    () =>
      formMetaData() &&
      hasPermissions(allConfiguredPermission(), "edit", graph, setGraph),
  );
  const hasDeletePermission = createMemo(
    () =>
      formMetaData() &&
      hasPermissions(allConfiguredPermission(), "delete", graph, setGraph),
  );
  const hasViewPermission = createMemo(
    () =>
      formMetaData() &&
      hasPermissions(allConfiguredPermission(), "view", graph, setGraph),
  );

  setGridState({
    allConfiguredPermission: allConfiguredPermission,
    formMetaData: formMetaData,
    hasDeletePermission: hasDeletePermission,
    hasEditPermission: hasEditPermission,
    hasInsertPermission: hasInsertPermission,
    hasViewPermission: hasViewPermission,
    get tableId() {
      return props.tableId;
    },
  });

  createEffect(
    on(
      [() => gridState.cardSize, () => gridState.layout],
      () => {
        graph.saveUserSetting({
          cardSize: gridState.cardSize,
          layout: gridState.layout,
        });
      },
      { defer: true },
    ),
  );

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
    let form = FormMetaData[props.tableId];
    if (!form) {
      form = FormMetaData.Form;
      const { incoming, outgoing } = getEdgesFromRowsAttr(form.attributes);
      const data = await fetchDataFromMG({
        expression: `g:'Form[${props.tableId}]'`,
        incoming,
        outgoing,
      });
      if (
        !(data && isValidResponse(data)) ||
        data.error ||
        data.result.length === 0
      ) {
        setGridState("error", `No ${props.tableId} configured`);
        return;
      }
      metaDtaInitialize(data);
    }
    form = gridState.metaVertex
      ? generateFormMetaAttributes(graph, setGraph, gridState.metaVertex)
      : FormMetaData[props.tableId];
    setFormMetaData(form);

    setGridState("isNoPermissionCheck", !gridState.metaVertex);
  };

  onMount(async () => {
    setGridState("isLoading", true);
    await loadMetaData();
    if (gridState.error) {
      setGridState("isLoading", false);
      return;
    }
    await fetchTableData();
    setGridState({ fetchTableData });
    props.initializeGridStoreParent?.(gridStore);
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

  async function fetchTableData(
    skip?: number,
    limit?: number,
    isLoadMore?: boolean,
  ) {
    setGridState("isLoading", true);
    const data = await (props.getTableData || defaultGetTableData)(
      formMetaData()!,
      props.tableId,
      skip,
      limit,
    );
    if (!isValidResponse(data)) {
      setGridState("error", getErrorMessage(data));
    } else {
      onTableDataGet(data, isLoadMore);
    }
    setGridState("isLoading", false);
    return data;
  }

  function onTableDataGet(data: ServerResult, isLoadMore?: boolean) {
    const vertexCount = data.result.length;
    setGridState("isShowLoadMore", vertexCount >= 10);
    setGraphData(graph, setGraph, data.graph);
    const resultData = data.result;
    const nodes: Vertex[] =
      isLoadMore && gridState.tableStore.data
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
    <DataGridProvider value={gridStore}>
      <Switch>
        <Match when={gridState.isLoading}>
          <LoaderNew loaderHeight="55vh" />
        </Match>
        <Match when={gridState.error}>
          {/* TODO: CSS */}
          <div>Error: {gridState.error}</div>
        </Match>
        <Match when={formMetaData()}>
          <GridHeader
            CustomAddNewButton={props.CustomAddNewButton}
            formMetaData={formMetaData()}
            onSearch={handleSearch}
          />
          <CommonTable
            allConfiguredPermission={allConfiguredPermission()}
            cardSize={gridState.cardSize}
            data={gridState.filteredData}
            defaultRowsPerPage={10}
            enableMultiRowSelection={props.enableMultiRowSelection}
            enableRowSelection={props.enableRowSelection}
            headers={gridState.tableStore.tableColumns}
            isSearching={gridState.isSearching}
            isShowLoadMore={gridState.isShowLoadMore}
            isShowPagination={props.isShowPagination}
            layout={gridState.layout}
            // TODO: Fix load more is broken, it doesnt update the state
            onLoadMore={(skip, limit) => fetchTableData(skip, limit, true)}
            rowsPerPageOptions={[5, 10, 15]}
            selectedRows={gridState.selectedRows}
            setSelectedRows={(rows: Vertex[]) =>
              setGridState("selectedRows", rows)
            }
            totalItems={gridState.filteredData.length}
          />
          <Show when={gridState.deleteRowId}>
            <DialogWithButtons
              message="Are you sure you want to delete this item?"
              onCancel={() => setGridState("deleteRowId", null)}
              onConfirm={onDelete}
              open={
                (() => gridState.deleteRowId) as unknown as Accessor<boolean>
              }
              setOpen={() => setGridState("deleteRowId", null)}
              title="Delete Item"
            />
          </Show>
        </Match>
      </Switch>
    </DataGridProvider>
  );
}
