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
  Show,
  Switch,
} from "solid-js";
import { createStore } from "solid-js/store";

import type { ServerResult } from "~/cypher/types/ServerResult";
import type { IFormMetaData } from "~/lib/meta/FormMetadataType";

import { DialogWithButtons } from "~/components/styled/DeleteDialog";
import { LoaderNew } from "~/components/styled/LoaderSimple";
import { CommonTable } from "~/components/styled/Table";
import { fetchDataFromMG } from "~/cypher/get/fetchDataFromMG";
import { getErrorMessage } from "~/lib/api/getErrorMessage";
import { isValidResponse } from "~/lib/api/isValidResponse";
import { saveUserSetting } from "~/lib/api/saveUserSetting";
import { isObject } from "~/lib/data_structure/object/isObject";
import { getEdgesFromRowsAttr } from "~/lib/graph/get/sync/getEdgesFromRowsAttr";
import { getGlobalStore } from "~/lib/graph/get/sync/getGlobalStore";
import { useGraph, type Vertex } from "~/lib/graph/graph";
import { setGraphData } from "~/lib/graph/mutate/setGraphData";
import { FormMetaData } from "~/lib/meta/formMetaData";
import { createInputFilteredFormMetaData } from "~/lib/meta/functions/createInputFilteredFormMetaData";

import {
  getConfiguredPermissions,
  hasPermissions,
} from "../page_attr_render/permissions";
import { generateFormMetaAttributes } from "../page_designer/functions/generateFormMetaAttributes";
import { CreateGridHeaders } from "./CreateGridHeaders";
import {
  DataGridProvider,
  type DataGridState,
  type DataGridStore,
  getInitialGridState,
} from "./DataGridContext";
import { getTableData as defaultGetTableData } from "./functions/getTableData";
import { useDeleteRowConfirm } from "./functions/useDeleteRowConfirm";
import { GridHeader } from "./GridHeader";

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

  const gridStore = createStore<DataGridState>({
    ...getInitialGridState(graph),
    fetchTableData,
    get tableId() {
      return props.tableId;
    }
  });
  props.initializeGridStoreParent?.(gridStore);
  const [gridState, setGridState] = gridStore;
  const [formMetaData, setFormMetaData] = createSignal<IFormMetaData | null>(null);

  const allConfiguredPermission = createMemo(() =>
    getConfiguredPermissions(getGlobalStore(graph).P.userRoles, gridState.metaVertex, graph, setGraph)
  );

  const permissionChecks = {
    hasDeletePermission: createMemo(() => formMetaData() && hasPermissions(allConfiguredPermission(), "delete", graph, setGraph)),
    hasEditPermission: createMemo(() => formMetaData() && hasPermissions(allConfiguredPermission(), "edit", graph, setGraph)),
    hasInsertPermission: createMemo(() => formMetaData() && hasPermissions(allConfiguredPermission(), "insert", graph, setGraph)),
    hasViewPermission: createMemo(() => formMetaData() && hasPermissions(allConfiguredPermission(), "view", graph, setGraph)),
  };

  setGridState({
    allConfiguredPermission,
    formMetaData,
    ...permissionChecks,
  });

  createEffect(
    on(
      [() => gridState.cardSize, () => gridState.layout],
      () => {
        saveUserSetting({
          cardSize: gridState.cardSize,
          layout: gridState.layout,
        }, graph, setGraph);
      },
      { defer: true }
    )
  );

  const initializeDataGrid = async () => {
    setGridState("isLoading", true);
    await loadMetaData();
    if (gridState.error) {
      setGridState("isLoading", false);
      return;
    }
    await fetchTableData();
  };

  createEffect(() => {
    if (props.tableId) {
      setGridState("error", undefined);
      initializeDataGrid();
    } else {
      setGridState("error", "No tableId provided");
    }
  });

  const loadMetaData = async () => {
    const form = FormMetaData[props.tableId] || FormMetaData.Form;
    const isDynamicForm = props.tableId !== "Form" && form === FormMetaData.Form;
    if (isDynamicForm) {
      const { incoming, outgoing } = getEdgesFromRowsAttr(form.attributes);
      const data = await fetchDataFromMG({
        expression: `g:'Form[${props.tableId}]'`,
        [getGlobalStore(graph).P.url]: true,
        incoming,
        outgoing,
      });

      if (!isValidResponse(data) || data.result.length === 0) {
        setGridState("error", `No ${props.tableId} configured`);
        return;
      }
      initializeMetaData(data);
    }

    const updatedForm = gridState.metaVertex
      ? generateFormMetaAttributes(graph, setGraph, gridState.metaVertex)
      : createInputFilteredFormMetaData(FormMetaData[props.tableId]);
    setFormMetaData(updatedForm);
    // when hardcoded form is used, no permission check is used currently, but this is a temporary solution
    setGridState("isNoPermissionCheck", !isDynamicForm);
  };

  const initializeMetaData = (data: ServerResult) => {
    setGraphData(graph, setGraph, data.graph!);
    const metaVertex = getMetaVertex(data.result);
    if (metaVertex) {
      setGridState("metaVertex", metaVertex);
    }
  };

  function getMetaVertex(result: any) {
    if (Array.isArray(result) && result.length > 0) {
      return graph.vertexes[result[0].id];
    } else if (isObject(result)) {
      return graph.vertexes[result.id];
    } else {
      return undefined;
    }
  }

  const handleSearch = (value: string) => {
    setGridState("search", value);
    const isSearching = !!value && value.length > 0;
    setGridState("isSearching", isSearching);

    const filtered = isSearching
      ? gridState.tableStore.data.filter((item: Vertex) =>
          Object.values(item.P).some((prop: unknown) =>
            prop?.toString().toLowerCase().includes(value.toLowerCase())
          )
        )
      : gridState.tableStore.data;

    setGridState("filteredData", filtered);
  };

  async function fetchTableData(skip?: number, limit?: number, isLoadMore?: boolean) {
    setGridState("isLoading", true);
    const data = await (props.getTableData || defaultGetTableData)(
      graph,
      formMetaData()!,
      props.tableId,
      skip,
      limit,
    );

    if (isValidResponse(data)) {
      onTableDataGet(data, isLoadMore);
    } else {
      setGridState("error", getErrorMessage(data));
    }
    setGridState("isLoading", false);
    return data;
  }

  function onTableDataGet(data: ServerResult, isLoadMore?: boolean) {
    const vertexCount = data.result.length;
    setGridState("isShowLoadMore", vertexCount >= 10);
    setGraphData(graph, setGraph, data.graph!);
    const nodes: Vertex[] = isLoadMore && gridState.tableStore.data
      ? [...gridState.tableStore.data, ...data.result]
      : data.result;

    const tableColumns = CreateGridHeaders(
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
