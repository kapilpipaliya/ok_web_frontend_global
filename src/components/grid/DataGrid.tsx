import {
  useContext,
  createSignal,
  Show,
  Switch,
  Match,
  onMount,
} from "solid-js";
import { useNavigate } from "@solidjs/router";
import { useToast } from "~/components/Toast";
import { GraphContext, type GraphInterface, type Id, type Vertex, } from "~/lib/graph/graph";
import { setGraphData } from "~/lib/websocket/setGraphData";
import { CommonTable } from "~/components/Table";
import { Icon } from "@iconify-icon/solid";
import { type SetStoreFunction, type Store, createStore } from "solid-js/store";
import { DeleteDialog } from "~/components/DeleteDialog";
import { LoaderNew } from "~/components/LoaderSimple";
import {
  capitalizeFirstLetter,
} from "~/lib/utils";
import type { ColumnDef } from "@tanstack/solid-table";
import { WsContext } from "~/lib/websocket/ws_events_dispatcher";
import type { IFormMetaData } from "~/lib/FormMetadataType";
import { PageContext } from "~/lib/contexts";
import {QuickEditModal} from "~/components/grid/QuickEditModal";
import {getSelectValue} from "~/components/grid/getSelectValue";
import {getTagValue} from "~/components/grid/getTagValue";

import { deleteRowConfirm } from "./deleteRow";
import { getTableData } from "./getTableData";
interface DataGridProps {
  tableId: string;
}

export function DataGrid(props: Readonly<DataGridProps>) {
  const [graph, setGraph] = useContext(GraphContext)!;
  const navigate = useNavigate();
  const { events } = useContext(PageContext);
  const { showErrorToast, showLoadingToast } = useToast();
  const [deleteRowId, setDeleteRowId] = createSignal<Id | null>(null);
  const [tableStore, setTableStore]: any = createStore({
    data: [],
    tableColumns: [],
  } as { data: any[]; tableColumns: ColumnDef<any>[] });
  const [isSearching, setIsSearching] = createSignal(false);
  const [isShowLoadMore, setIsShowLoadMore] = createSignal(true);
  const { Ws } = useContext(WsContext);

  if (!props.tableId) {
    return <>Incorrect Configuration</>;
  }

  type TableData = {
    error?: string;
    result?: any;
    graph?: {
      vertexes: {
        [key: string]: any;
      };
      edges: {
        [key: string]: any;
      };
    };
    form?: IFormMetaData;
  } | undefined;
  const [tableData, setTableData] = createSignal<TableData>(undefined);

  // createdResource caled Two times, making API Calles two times, so used onMount
  const [isLoading, setIsLoading] = createSignal(false);
  onMount(async () => {
    setIsLoading(true);
    const data = await getTableData(props.tableId);
    setTableData(data);
    onTableDataGet(data);
    setIsLoading(false);
  })

  const [search, setSearch] = createSignal("");
  const [filteredData, setFilteredData] = createSignal([]);

  const handleSearch = (value: string) => {
    setSearch(value);
    if (value && value.length > 0) {
      setIsSearching(true);

      const filtered: any = tableStore.data.filter(
        (item: Vertex) =>
          item.P.name?.toLowerCase().includes(value.toLowerCase()),
      );
      setFilteredData(filtered);
    } else {
      setIsSearching(false);
      setFilteredData(tableStore.data);
    }
  };

  function setGridHeaders(formNew: IFormMetaData) {
    return SetGridHeaders(formNew, graph, setGraph, setDeleteRowId, navigate, props.tableId);
  }

  function onTableDataGet(data: TableData) {
    if (data?.error) {
      showErrorToast(data.error);
    } else if (data) {
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
      const tableColumns = setGridHeaders(data.form!);
      setTableStore({ data: nodes, tableColumns });
      setSearch("");
      setFilteredData(nodes);
    }
  }

  return (
    <Switch>
      <Match when={isLoading()}>
        <LoaderNew loaderHeight="55vh" />
      </Match>
      <Match when={tableData()?.error}>Error {tableData()?.error}</Match>
      <Match when={tableStore.data?.length > 0}>
        <div class="flex jc:space-between ai:center p:5">
          <button
            onClick={() => navigate("new")}
            class="flex ai:center jc:center p:7px|10px mb:10 bg:#f0f0f0 border:1px|solid|#ccc r:5 bg:#e0e0e0:hover border:#bbb:hover"
          >
            <Icon
              icon={"lets-icons:add-round"}
              height={22}
              width={22}
              class="mr:5"
            />
            <span>Add New</span>
          </button>
          <nav class="flex ai:center mb:10">
            <div class="group">
              <Icon
                class="icon"
                icon="iconamoon:search"
                style={{ color: "#9e9ea7" }}
              />

              <form autocomplete="off" method="post" action="">
                <input
                  placeholder="Search Data..."
                  type="search"
                  autocomplete="none"
                  class="inputSearch f:14"
                  value={search()}
                  onInput={(e) => {
                    handleSearch(e.target.value);
                  }}
                />
              </form>
            </div>
          </nav>
        </div>
        <CommonTable
          headers={tableStore.tableColumns}
          data={filteredData()}
          isSearching={isSearching()}
          isShowLoadMore={isShowLoadMore()}
          rowsPerPageOptions={[5, 10, 15]}
          defaultRowsPerPage={10}
          onLoadMore={(skip, limit)=> getTableData(props.tableId, skip, limit)}
          totalItems={filteredData().length}
        />
        <Show when={deleteRowId()}>
          <DeleteDialog
            open={true}
            onConfirm={() => deleteRowConfirm(deleteRowId()!, graph, setGraph, showErrorToast, showLoadingToast, navigate, Ws)}
            title="Delete Item"
            message="Are you sure you want to delete this item?"
          />
        </Show>
      </Match>
    </Switch>
  );
}

function SetGridHeaders(formNew: IFormMetaData, graph: Store<GraphInterface>, setGraph: SetStoreFunction<GraphInterface>, setDeleteRowId: (id:Id)=>void, navigate: (path:string)=>void, tableId: string) {
  const tableColumns = [] as ColumnDef<any>[];

  for (const attribute of formNew.attributes) {
    const column = { ...attribute } as unknown as ColumnDef<any>;
    if (attribute.component === "Table") continue;
    // @ts-ignore
    column.accessorKey = `P.${attribute.name}`;
    column.id = attribute.name;
    column.cell = (info) => {
      return (
        <Switch>
          <Match
            when={
              attribute.component === "SelectBox" && !attribute.props?.items
            }
          >
            {getSelectValue({
              attribute: attribute,
              info: info,
              graph: graph,
              setGraph: setGraph,
            })}
          </Match>

          <Match
            when={attribute.component === "TagBox" && !attribute.props?.items}
          >
            {getTagValue({
              attribute: attribute,
              info: info,
              graph: graph,
              setGraph: setGraph,
            })}
          </Match>

          <Match when={attribute.component === "CheckBox"}>
            <span>
              {info.getValue() === true
                ? "Yes"
                : info.getValue() === false
                  ? "No"
                  : ""}
            </span>
          </Match>

          <Match when={true}>{info.getValue<string>()}</Match>
        </Switch>
      );
    };
    column.header = (info) =>
      capitalizeFirstLetter(
        attribute.title || attribute.displayName || attribute.name,
      );
    column.footer = (info) =>
      capitalizeFirstLetter(
        attribute.title || attribute.displayName || attribute.name,
      );
    tableColumns.push(column);
  }
  tableColumns.push({
    accessorKey: "Actions",
    header: "Actions",
    footer: "",
    cell: (info) => {
      return (
        <Switch>
          <Match when={formNew.isInlineEditable}>
            <div class="flex gap:10px ai:center  jc:center cursor:pointer">
              <QuickEditModal
                info={info}
                graph={graph}
                setGraph={setGraph}
                tableId={tableId}
              />
              <Icon
                onclick={() => {
                  setDeleteRowId(info.row.original.id);
                }}
                icon="fluent:delete-12-regular"
                class="color:rgb(255,0,0)"
                height={22}
                width={22}
              />
            </div>
          </Match>

          <Match when={!formNew.isInlineEditable}>
            <div class="py:0.25rem">
              <div class="flex gap:10px ai:center  jc:center r:7 cursor:pointer">
                <Icon
                  onClick={() => navigate(`./${info.row.original.id}`)}
                  height={21}
                  width={21}
                  class={"color:#3477CC"}
                  icon="fluent:edit-12-regular"
                />
                <Icon
                  onclick={() => {
                    setDeleteRowId(info.row.original.id);
                  }}
                  icon="fluent:delete-12-regular"
                  class="color:rgb(255,0,0)"
                  height={22}
                  width={22}
                />
              </div>
            </div>
          </Match>
        </Switch>
      );
    },
  });
  return tableColumns;
}
