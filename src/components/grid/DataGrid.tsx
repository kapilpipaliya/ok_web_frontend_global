import {
  useContext,
  createSignal,
  createResource,
  Show,
  Switch,
  Match,
  createEffect,
  on,
} from "solid-js";
import { useLocation, useNavigate } from "@solidjs/router";
import { useToast } from "~/components/Toast";
import {
  commitTransaction,
  getNewTxnId,
  ProcessStatus,
} from "~/lib/graph/transaction";
import { deleteVertex } from "~/lib/graph/mutate/vertex";
import { GraphContext, IdAttr, type Vertex, } from "~/lib/graph/graph";
import { setGraphData } from "~/lib/websocket/setGraphData";
import { CommonTable } from "~/components/Table";
import { Icon } from "@iconify-icon/solid";
import { createStore } from "solid-js/store";
import { submitDataCall } from "~/lib/api/api_functions";
import { DeleteDialog } from "~/components/DeleteDialog";
import { LoaderNew } from "~/components/LoaderSimple";
import {
  capitalizeFirstLetter,
} from "~/lib/utils";
import type { ColumnDef } from "@tanstack/solid-table";
import { WsContext } from "~/lib/websocket/ws_events_dispatcher";
import type { IFormMetaData } from "~/lib/FormMetadataType";
import { FormMetaDataAuth } from "~/lib/formMetaDataAuth";
import { FormMetaData } from "~/lib/formMetaData";
import { GenericField } from "~/components/fields/GenericField";
import { PageContext } from "~/lib/contexts";
import { getEdgesFromRowsAttr } from "~/lib/getEdgesFromRowsAttr";
import { paginationExpression } from "~/lib/graph/get/sync/paginationExpression";
import { getDataMGCall } from "~/cypher/get/getDataMGCall";
import {QuickEditModal} from "~/components/grid/QuickEditModal";
import {getSelectValue} from "~/components/grid/getSelectValue";
import {getTagValue} from "~/components/grid/getTagValue";
interface DataGridProps {
  tableId: string;
}

export function DataGrid(props: DataGridProps) {
  const [graph, setGraph] = useContext(GraphContext)!;
  const navigate = useNavigate();
  const datas = useLocation();
  const { events } = useContext(PageContext);
  const { showErrorToast, showLoadingToast } = useToast();
  const [deleteRowId, setDeleteRowId] = createSignal(null);
  const [tableStore, setTableStore]: any = createStore({
    data: [],
    tableColumns: [],
  } as { data: any[]; tableColumns: ColumnDef<any>[] });
  const [isSearching, setIsSearching] = createSignal(false);
  const [isShowLoadMore, setIsShowLoadMore] = createSignal(true);
  const { Ws } = useContext(WsContext);

  const collection = props.tableId;
  if (!collection) {
    return <>Incorrect Configuration</>;
  }


  const deleteObject = async (id: any) => {
    const txnId = getNewTxnId(graph, setGraph);
    const deleteResult = deleteVertex(txnId, id, graph, setGraph);
    if (deleteResult?.error) {
      showErrorToast(deleteResult?.error.toString());
      return;
    }
    graph.transactions.get(txnId)!.status = ProcessStatus.Ready;
    const data = commitTransaction(Ws, graph);
    if (!data) {
      return;
    }
    await showLoadingToast({
      promise: submitDataCall(data, graph, setGraph, txnId),
      loadMessage: "Submitting Data...",
      successMessage: "Data submitted successfully",
      onSuccess: () => setTimeout(() => navigate(-1), 0),
    });
  };

  async function getTableData(skip?: number, limit?: number): Promise<{
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
  }> {
    try {
      const form = FormMetaData[props.tableId] || FormMetaDataAuth[props.tableId];
      if (!form) {
        return { error: "Form not found" };
      }
      const { incoming, outgoing }: { incoming: any; outgoing: any } =
        getEdgesFromRowsAttr(form.attributes);
      // `g:'${coll}[filterdfghj skip=${skip ?? 0} limit=${limit ?? 10}]'`
      const expression = paginationExpression({
        coll: collection,
        skip: skip,
        limit: limit,
        filter: "",
      });

      const result = await getDataMGCall({
        expression,
        incoming,
        outgoing,
      });
      return { ...result, form: JSON.parse(JSON.stringify(form)) };
    } catch (e: any) {
      console.error("error", e);
      // when error happen server function doesn't return error message
      return { error: `Error When Loading Form: ${e.message}` };
    }
  }

  const [dataResource] = createResource(async () => await getTableData());
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
    const tableColumns = [] as ColumnDef<any>[];

    for (const attribute of formNew?.attributes) {
      const column = { ...attribute } as unknown as ColumnDef<any>;
      if (attribute.component === "Table") continue;
      // if (attribute.props?.skip) continue;
      // @ts-ignore
      column.accessorKey = `P.${attribute.name}`;
      // column.accessorFn = row => row.lastName;
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
          // @ts-ignore
          info.column.columnDef.displayName || info.column.columnDef.name,
        );
      column.footer = (info) =>
        capitalizeFirstLetter(
          // @ts-ignore
          info.column.columnDef.displayName || info.column.columnDef.name,
        );
      tableColumns.push(column);
    }
    tableColumns.push({
      accessorKey: "Actions",
      header: "Actions",
      footer: "",
      cell: (info) => {
        const [open, setOpen] = createSignal(false);
        return (
          <Switch>
            <Match when={formNew.isInlineEditable}>
              <div class="flex gap:10px ai:center  jc:center cursor:pointer">
                <QuickEditModal
                  info={info}
                  graph={graph}
                  setGraph={setGraph}
                  tableId={props.tableId}
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

  createEffect(on(dataResource, (data) => {
    if (data?.error) {
      showErrorToast(data.error);
      return;
    } else if (data) {
      const vertexCount = Object.keys(data.graph!.vertexes).length;
      if (vertexCount < (undefined ?? 10)! || vertexCount === 0) {
        setIsShowLoadMore(false);
      } else {
        setIsShowLoadMore(true);
      }
      setGraphData(graph, setGraph, data.graph!);
      const resultData = Object.values(data.graph!.vertexes as Vertex[]).filter(
        (v) => v.L[0] === collection,
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
  }))

  return (
    <Switch>
      <Match when={dataResource.loading}>
        <LoaderNew loaderHeight="55vh" />
      </Match>
      <Match when={dataResource.error}>Error {dataResource.error}</Match>
      <Match when={tableStore.data?.length > 0}>
        <div class="flex jc:space-between ai:center p:5">
          <GenericField
            meta={
              {
                P: {
                  component: "Button",
                  [IdAttr]: "meta",

                  onClick: () => navigate("new"),
                  variant: "soft",
                  style: { padding: "7px 10px", "margin-bottom": "10px" },
                  leading:
                    // TO solve Hydration error passed a function
                    () => (
                      <Icon
                        icon={"lets-icons:add-round"}
                        height={22}
                        width={22}
                      />
                    ),
                  children: "Add New",

                },
              } as unknown as Vertex
            }
          />
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
          onLoadMore={getTableData}
          totalItems={filteredData().length}
        />
        <Show when={deleteRowId()}>
          <DeleteDialog
            open={true}
            onConfirm={() => deleteObject(deleteRowId())}
            title="Delete Item"
            message="Are you sure you want to delete this item?"
          />
        </Show>
      </Match>
    </Switch>
  );
}
