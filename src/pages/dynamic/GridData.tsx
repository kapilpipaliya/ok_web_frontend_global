import { useLocation, useNavigate, useParams } from "@solidjs/router";
import { CellContext, ColumnDef } from "@tanstack/solid-table";
import {
  Accessor,
  createEffect,
  createMemo,
  createResource,
  createSignal,
  Match,
  onCleanup,
  onMount,
  Show,
  Switch,
  untrack,
  useContext,
} from "solid-js";
import {
  GraphContext,
  GraphInterface,
  Id,
  IdAttr,
  Vertex,
} from "~/lib/graph/graph";
import {
  commitTransaction,
  getNewTxnId,
  ProcessStatus,
  transactions,
} from "~/lib/graph/transaction";

import { Icon } from "@iconify-icon/solid";
import { GenericField } from "~/components/dynamic/fields/static/GenericFieldComponent";
import {
  collectionNameDisplayExpr,
  selectedValue,
} from "~/components/dynamic/fields/input/SelectInputField";
import {
  APP_BASE_URL,
  breadcrumbData,
  capitalizeFirstLetter,
  IFormContext,
  isNumber,
  PageContext,
} from "~/lib/Utils";
import { getSelectionOptions } from "~/lib/graph/get/sync/traverse";
import { createMeta } from "~/lib/graph/mutate/form_functions";
import { deleteVertex } from "~/lib/graph/mutate/vertex";
import { AttrsTableData } from "~/lib/api";
import { WsContext } from "~/lib/websocket/ws_events_dispatcher";
import { AbstractSingleForm } from "~/components/dynamic/components/DynamicForm";
import { AttrsAdminTableData } from "~/lib/apiAdmin";
import { FieldAttribute, FormMetaData } from "~/lib/Type";
import Dismiss from "solid-dismiss";
import { createStore, SetStoreFunction } from "solid-js/store";
import PageHeader from "~/components/custom/Breadcumb";
import { getFormApiFromFormAsync } from "~/lib/graph/get/async/graph_functions";
import { findVertexByLabelAndUniqueId } from "~/lib/graph/get/sync/findVertex";
import { useToast } from "~/components/custom/Toast";
import { DeleteDialog } from "~/components/custom/DeleteDialog";
import { submitDataCall } from "~/components/api/api_functions";
import { renderNavTreeFromGraph } from "../dashboard/Sidebar";
import { Popover } from 'solid-simple-popover'
import { getFormApiFromFormMGCall } from "~/cypher_api/lib/graph/get/async/graph_functions";
import { Expression, getDataMGCall, getTreeDataMGCall } from "~/cypher_api/lib/graph/get/async/traverse";
import { setGraphData } from "~/lib/websocket/ws_events";
import { LoaderNew } from "~/components/custom/LoaderSimple";
import { CommonTable } from "~/components/custom/Table";
interface AbstractGridProps {
  tableId: string;
}

interface DataGridProps {
  tableId: string;
}

const QuickEditModal = (p: {
  graph: GraphInterface;
  setGraph: SetStoreFunction<GraphInterface>;
  tableId: any;
  info: any;
}) => {
  const [open, setOpen] = createSignal(false);
  const config = createStore({} as { formData: IFormContext });
  let btnEl;
  let btnPopUp;

  const closePopUp = () => {
    setOpen(false);
  };

  return (
    <Show when={p.tableId}>
      <Icon
        ref={btnEl}
        height={22}
        width={22}
        color={"grey"}
        aria-disabled={open()}
        class={`cursor:pointer bg:lightgrey:hover r:5|5|5|5 p:5|5|5|5 color:cornflowerblue`}
        onClick={() => {
          setOpen(true);
        }}
        icon={"fluent:edit-12-regular"}
      ></Icon>
      <Dismiss
        closeWhenEscapeKeyIsPressed={true}
        menuButton={btnEl}
        open={open}
        setOpen={setOpen}
        menuPopup={btnPopUp}
        animation={{ name: "fade", appendToElement: "menuPopup" }}
        modal
      >
        <div class="modal-container" role="presentation" ref={btnPopUp}>
          <div
            class="modal min-w:30% r:10px p:0"
            role="dialog"
            aria-modal="true"
            tabindex="-1"
          >
            <div class={"mb:4 font-weight:bold"}>
              Quick Edit
              <button
                title={"Close"}
                onClick={closePopUp}
                class={"bg:lightgrey:hover r:5|5|5|5 p:0|5|0|5"}
                style={{ float: "right" }}
              >
                ✕
              </button>
            </div>
            <hr class={"fg:lightgrey"} />

            <div class={"p:3 mt:10 max-h:50vh overflow:auto"}>
              <AbstractSingleForm
                formId={p.tableId}
                graph={p.graph}
                id={p.info.row.original.id}
                buttonAlign="end"
                isDialogContext={true}
                showMainFieldsOnly={true}
                importExportButtons={false}
                doMount={false}
                setGraph={p.setGraph}
              />
            </div>
          </div>
        </div>
      </Dismiss>
    </Show>
  );
};

// TODO: add filter like: https://js.devexpress.com/Demos/WidgetsGallery/Demo/FilterBuilder/WithDataGrid/jQuery/Light/

export function AbstractGrid(props: AbstractGridProps) {
  const [graph, setGraph] = useContext(GraphContext)!;
  const [locationData, setLocationData] = createSignal([]);
  const data = findVertexByLabelAndUniqueId(
    graph,
    "Coll",
    IdAttr,
    props.tableId
  );
  const param = useLocation();

  const nestedName = createMemo(
    () => findVertexByLabelAndUniqueId(graph, "Coll", IdAttr, props.tableId)?.P
      ?.name
  );
  async function getNavData() {
    const data: any = await await getTreeDataMGCall({
      collection: "g:'Nav[Navigation]'",
      // TODO: Dont display "Form" Component
      child: { collection: "->NavAttr", child: { collection: "->NavAttr", child: { collection: "->NavAttr" } } },
    });
    return data.children[0].children;
  }

  // used to refresh table:
  const [tableId, setTableId] = createSignal("");
  createEffect(() => {
    // clear the state when routes parameter changes.
    setTableId("");
    props.tableId;
    setTimeout(() => setTableId(props.tableId));
  });
  const getCurrentLocation: any = (data: any, path = []) => {
    for (const item of data) {
      if (item.P.url === param.pathname) {
        return [...path, item.name];
      }
      if (item.children) {
        const result = getCurrentLocation(item.children, [...path, item.name]);
        if (result.length > 0) {
          return result;
        }
      }
    }
    return [];
  };
  const params = useParams();
  const [nav] = createResource(tableId, async () => {
    const navData = await getNavData();
    const filtered = getCurrentLocation(navData);
    setLocationData(filtered);
    return filtered;
  });

  const navigate = useNavigate();

  return (
    <>
      <Show when={locationData()[0] !== undefined}>
        <PageHeader
          title={`${locationData()[0]}`}
          breadcrumb={[
            ...breadcrumbData,
            { name: `${locationData()[1]}` },
            { name: locationData()[2] },
          ]} />
      </Show>
      <div class="flex justify-content:start p:5">
        <GenericField
          meta={{
            P: {
              component: "Button",
              [IdAttr]: "meta",
              props: {
                onClick: () => navigate("new"),
                variant: "soft",
                style: { padding: "7px 10px" },
                leading: (
                  // TO solve Hydration error passed a function
                  () => <Icon
                    icon={"lets-icons:add-round"}
                    height={22}
                    width={22} />
                ),
                children: "Add New",
              },
            },
          } as unknown as Vertex} />
      </div>
      <Show when={tableId()}>
        <DataGrid tableId={tableId()} />
      </Show>
    </>
  );
}

const DataGrid = (props: DataGridProps) => {
  const [graph, setGraph] = useContext(GraphContext)!;
  let { events } = useContext(PageContext);
  const { Ws } = useContext(WsContext);
  const navigate = useNavigate();
  const { showErrorToast, showLoadingToast } = useToast();
  const [deleteRowId, setDeleteRowId] = createSignal(null);
  const [tableStore, setTableStore] = createStore(
    {} as { tableColumns: ColumnDef<any>[]; data: any[] },
  );
  const [totalItems, setTotalItems] = createSignal(0);
  const [isShowLoadMore, setIsShowLoadMore] = createSignal(true);

  const SelectValue = (props: {
    attribute: FieldAttribute;
    info: CellContext<any, any>;
  }) => {
    const vertex = selectedValue(
      {
        P: props.attribute,
      } as unknown as Vertex,
      props.info.row.original,
      graph,
    );
    if (vertex[0]) {
      return getSelectionOptions(
        graph,
        setGraph,
        [graph.vertexes[vertex[0]]],
        props.attribute.props?.displayExpr ||
        collectionNameDisplayExpr(graph, props.attribute.props?.collection) ||
        `::'P.${IdAttr}'`,
      ).vertexes;
    }
    return "";
  };

  const TagValue = (props: {
    attribute: FieldAttribute;
    info: CellContext<any, any>;
  }) => {
    const vertex = selectedValue(
      {
        P: props.attribute,
      } as unknown as Vertex,
      props.info.row.original,
      graph,
    );
    if (vertex) {
      const textArray = [];
      for (const v of vertex) {
        const text = getSelectionOptions(
          graph,
          setGraph,
          [graph.vertexes[v]],
          props.attribute.props?.displayExpr || `::'P.${IdAttr}'`,
        ).vertexes;
        textArray.push(text);
      }
      return textArray.join(", ");
    }
    return "";
  };

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

    const tableColumns = [] as ColumnDef<any>[];

    for (const attribute of formNew!.attributes) {
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
              <SelectValue attribute={attribute} info={info} />
            </Match>

            <Match
              when={attribute.component === "TagBox" && !attribute.props?.items}
            >
              <TagValue attribute={attribute} info={info} />
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
      // @ts-ignore
      column.header = (info) =>
        capitalizeFirstLetter(
          // @ts-ignore
          info.column.columnDef.displayName || info.column.columnDef.name,
        );
      // @ts-ignore
      column.footer = (info) =>
        capitalizeFirstLetter(
          // @ts-ignore
          info.column.columnDef.displayName || info.column.columnDef.name,
        );

      // @ts-ignore
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
                    onClick={() =>
                      navigate(
                        `./${info.row.original.id}`,
                      )
                    }
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

    // TODO: If collection is number fetch vertex from the API
    const coll = isNumber(collection)
      ? graph.vertexes[collection].P[IdAttr]
      : collection;
    // if(!graph.vertexLabelIdMap[coll]) {
    //  alert(`collection not found ${coll}`)
    //  return;
    // }

    const outgoing = [] as Expression[];
    const incomming = [] as Expression[];
    for (const attribute of formNew.attributes) {
      if (attribute.component === 'SelectBox' || attribute.component === 'TagBox') {
        if (attribute.props?.inward) {
          incomming.push({ expression: `<-${capitalizeFirstLetter(attribute.name)}$0` });
        } else {
          outgoing.push({ expression: `->$0${capitalizeFirstLetter(attribute.name)}` });
        }
      }
    }
    const result = await getDataMGCall({
      expression: `g:'${coll}[filterdfghj skip=${skip ?? 0} limit=${limit ?? 10}]'`, incoming: incomming, outgoing
    });
    
    const vertexCount = Object.keys(result.graph.vertexes).length;
    if (vertexCount < (limit ?? 10)! || vertexCount === 0) {
      setIsShowLoadMore(false);
    } else {
      setIsShowLoadMore(true);
    }
    setGraphData(graph, setGraph, result.graph);
    const resultData = Object.values(result.graph.vertexes);
    const nodes = tableStore.data ? [...tableStore.data, ...resultData] : resultData;
    setTotalItems(nodes.length);
    setTableStore({ data: nodes, tableColumns });
}

  const deleteObject = async (id: Id) => {
    const txnId = getNewTxnId(graph, setGraph);
    const deleteResult = deleteVertex(txnId, id, graph, setGraph);
    // @ts-ignore
    if (deleteResult?.error) {
      showErrorToast(deleteResult?.error.toString());
      return;
    }
    transactions.get(txnId)!.status = ProcessStatus.Ready;
    const data = commitTransaction(Ws);
    if (!data) {
      return;
    }
    await showLoadingToast({
      promise: submitDataCall(data, txnId),
      loadMessage: "Submitting Data...",
      successMessage: "Data submitted successfully",
      onSuccess: (value) => {
        // currently we are navigating back.
        setTimeout(() => navigate(-1), 0);
      },
    });
  };

  const [data, { mutate, refetch }] = createResource(async () => {
    await getTableData();
  });

  onCleanup(() => events?.setTitle(""));

  return (
      <Switch>
        <Match when={data.loading}>
          <LoaderNew loaderHeight="55vh"/>
        </Match>

        <Match when={data.error}>Error {data.error}</Match>

        <Match when={tableStore.data}>
          <CommonTable
            headers={tableStore.tableColumns}
            data={tableStore.data}
            isShowLoadMore={isShowLoadMore()}
            rowsPerPageOptions={[5, 10, 15]}
            defaultRowsPerPage={10}
            onLoadMore={getTableData}
            totalItems={totalItems()}
          />
          <Show when={deleteRowId()}>
            <DeleteDialog
              open={true}
              onConfirm={() => {
                deleteObject(deleteRowId()!);
              }}
              title={"Delete Item"}
              message={"Are you sure you want to delete this item?"}
            />
          </Show>
        </Match>
      </Switch>
  );

};


