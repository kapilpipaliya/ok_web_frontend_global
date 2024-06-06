import {
  useContext,
  createSignal,
  createResource,
  Show,
  Switch,
  Match,
} from "solid-js";
import { useLocation, useNavigate } from "@solidjs/router";
import { useToast } from "~/components/custom/Toast";
import {
  commitTransaction,
  getNewTxnId,
  ProcessStatus,
  transactions,
} from "~/lib/graph/transaction";
import { deleteVertex } from "~/lib/graph/mutate/vertex";
import { GraphContext, IdAttr, Vertex, VertexMap } from "~/lib/graph/graph";
import { getFormApiFromFormMGCall } from "~/cypher_api/lib/graph/get/async/graph_functions";
import { getDataMGCall } from "~/cypher_api/lib/graph/get/async/traverse";
import { setGraphData } from "~/lib/websocket/ws_events";
import { CommonTable } from "~/components/custom/Table";
import { Icon } from "@iconify-icon/solid";
import { createStore } from "solid-js/store";
import { submitDataCall } from "~/components/api/api_functions";
import { DeleteDialog } from "~/components/custom/DeleteDialog";
import { LoaderNew } from "~/components/custom/LoaderSimple";
import {
  PageContext,
  capitalizeFirstLetter,
  expressionString,
  getEdgesFromRowsAttr,
  isNumber,
} from "~/lib/Utils";
import { QuickEditModal, SelectValue, TagValue } from "./GridUtils";
import type { ColumnDef } from "@tanstack/solid-table";
import { WsContext } from "~/lib/websocket/ws_events_dispatcher";
import type { FormMetaData } from "~/lib/Type";
import { AttrsAdminTableData } from "~/lib/apiAdmin";
import { AttrsTableData } from "~/lib/api";
import { GenericField } from "~/components/dynamic/fields/static/GenericFieldComponent";
interface DataGridProps {
  tableId: string;
}

const DataGrid = (props: DataGridProps) => {
  const [graph, setGraph] = useContext(GraphContext)!;
  const navigate = useNavigate();
  const datas = useLocation();
  const { events } = useContext(PageContext);
  const { showErrorToast, showLoadingToast } = useToast();
  const [deleteRowId, setDeleteRowId] = createSignal(null);
  const [tableStore, setTableStore] = createStore({
    data: [],
    tableColumns: [],
  } as { data: any[]; tableColumns: ColumnDef<any>[] });
  const [isSearching, setIsSearching] = createSignal(false);
  const [isShowLoadMore, setIsShowLoadMore] = createSignal(true);
  const { Ws } = useContext(WsContext);

  const deleteObject = async (id: any) => {
    const txnId = getNewTxnId(graph, setGraph);
    const deleteResult = deleteVertex(txnId, id, graph, setGraph);
    if (deleteResult?.error) {
      showErrorToast(deleteResult?.error.toString());
      return;
    }
    // @ts-ignore
    transactions.get(txnId).status = ProcessStatus.Ready;
    const data = commitTransaction(Ws);
    if (!data) {
      return;
    }
    await showLoadingToast({
      promise: submitDataCall(data, txnId),
      loadMessage: "Submitting Data...",
      successMessage: "Data submitted successfully",
      onSuccess: () => setTimeout(() => navigate(-1), 0),
    });
  };

  const [data] = createResource(async () => await getTableData());
  const [search, setSearch] = createSignal("");
  const [filteredData, setFilteredData] = createSignal([]);

  const handleSearch = (value: string) => {
    setSearch(value);
    if (value && value.length > 0) {
      setIsSearching(true);

      const filtered = tableStore.data.filter((item: Vertex) =>
        item.P.name && item.P.name.toLowerCase().includes(value.toLowerCase()),
      );
      setFilteredData(filtered);
    } else {
      setIsSearching(false);
      setFilteredData(tableStore.data);
    }
  }


    return (
      <Switch>
        <Match when={data.loading}>
          <LoaderNew loaderHeight="55vh" />
        </Match>
        <Match when={data.error}>Error {data.error}</Match>
        <Match when={tableStore.data}>
          <div class="flex jc:space-between ai:center p:5">
            <GenericField
              meta={
                {
                  P: {
                    component: "Button",
                    [IdAttr]: "meta",
                    props: {
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

    async function getTableData(skip?: number, limit?: number) {
      //const form = await getFormApiFromFormAsync(graph, setGraph, props.tableId);
      const form = await getFormApiFromFormMGCall(props.tableId);
      let formNew: FormMetaData;
      let collection: string;

      if (form.error) {
        if (AttrsTableData[props.tableId] || AttrsAdminTableData[props.tableId]) {
          formNew =
            AttrsTableData[props.tableId] || AttrsAdminTableData[props.tableId];
          collection = props.tableId;
        } else {
          return form.error;
        }
      } else {
        formNew = form.form!;
        // @ts-ignore
        collection = form.form.collection as string;
      }
      if (!collection) {
        return <>Incorrect Configuration</>;
      }
      events?.setTitle(formNew.title);

      const tableColumns = setGridHeaders(formNew);

      // TODO: If collection is number fetch vertex from the API
      const coll = isNumber(collection)
        ? graph.vertexes[collection].P[IdAttr]
        : collection;

      // if(!graph.vertexLabelIdMap[coll]) {
      //  alert(`collection not found ${coll}`)
      //  return;
      // }

      const { incoming, outgoing }: { incoming: any; outgoing: any } =
        getEdgesFromRowsAttr(formNew.attributes);
      // `g:'${coll}[filterdfghj skip=${skip ?? 0} limit=${limit ?? 10}]'`
      const expression = expressionString({
        coll: coll,
        skip: skip,
        limit: limit,
        filter: "",
      })

      const result = await getDataMGCall({
        expression,
        incoming,
        outgoing,
      });

      const vertexCount = Object.keys(result.graph.vertexes).length;
      if (vertexCount < (limit ?? 10)! || vertexCount === 0) {
        setIsShowLoadMore(false);
      } else {
        setIsShowLoadMore(true);
      }
      setGraphData(graph, setGraph, result.graph);
      const resultData = Object.values(result.graph.vertexes as Vertex[]).filter(v => v.L[0] === coll);
      const nodes = tableStore.data
        ? [...tableStore.data, ...resultData]
        : resultData;
      setTableStore({ data: nodes, tableColumns });
      setSearch("");
      setFilteredData(nodes);
    }

    function setGridHeaders(formNew: FormMetaData) {
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
                <SelectValue
                  attribute={attribute}
                  info={info}
                  graph={graph}
                  setGraph={setGraph}
                />
              </Match>

              <Match
                when={attribute.component === "TagBox" && !attribute.props?.items}
              >
                <TagValue
                  attribute={attribute}
                  info={info}
                  graph={graph}
                  setGraph={setGraph}
                />
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
  };

  export default DataGrid;
