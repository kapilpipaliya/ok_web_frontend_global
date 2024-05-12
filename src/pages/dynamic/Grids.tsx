// Comment This Lines in web build
import { A, useLocation, useNavigate, useParams } from "@solidjs/router";
import {
  CellContext,
  ColumnDef,
  createSolidTable,
  getCoreRowModel,
} from "@tanstack/solid-table";
import {
  Accessor,
  createEffect,
  createMemo,
  createResource,
  createSignal,
  For,
  Match,
  onCleanup,
  Show,
  splitProps,
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
  getNewTxnId, ProcessStatus,
  transactions
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
  isNumber,
  PageContext,
} from "~/lib/Utils";
import {
  createMeta,
  getChildVertexes,
  getSelectionOptions, Record
} from "~/lib/graph/get/sync/graph_fns";
import { deleteVertex } from "~/lib/graph/mutate/vertex";
import { AttrsTableData } from "~/lib/api";
import { WsContext } from "~/lib/websocket/ws_events_dispatcher";
import { AbstractSingleForm } from "~/components/dynamic/components/DynamicForm";
import CustomButton from "~/components/solid-blocks/blocks/button/buttons";
import { AttrsAdminTableData } from "~/lib/apiAdmin";
import { FieldAttribute, FormMetaData } from "~/lib/Type";
import { CollapsibleTable } from "~/components/custom/Table";
import Dismiss from "solid-dismiss";
import { SetStoreFunction, createStore } from "solid-js/store";
import PageHeader from "~/components/custom/Breadcumb";
import { renderNavTreeFromGraph } from "~/components/layout/Sidebar";
import { getFormApiFromForm } from "~/lib/graph/get/async/graph_functions";
import { findVertexByLabelAndUniqueId } from "~/lib/graph/get/sync/findVertex";

interface AbstractSingleGridProps {
  tableId: string;
}

interface DataGridProps {
  tableId: string;
}

const Modal = (p: {
  graph: GraphInterface;
  setGraph: SetStoreFunction<GraphInterface>;
  tableId: any;
  info: any;
}) => {
  const [open, setOpen] = createSignal(false);
  let btnEl;
  let btnPopUp;

  const closePopUp = () => {
    setOpen(false);
  };

  return (
    <>
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
                // @ts-ignore
                config={{}}
                showMainFieldsOnly={true}
                importExportButtons={false}
                doMount={false}
                setGraph={p.setGraph}
              />
            </div>
          </div>
        </div>
      </Dismiss>
    </>
  );
};
// TODO: add filter like: https://js.devexpress.com/Demos/WidgetsGallery/Demo/FilterBuilder/WithDataGrid/jQuery/Light/
export const DataGrid = (props: DataGridProps) => {
  const [graph, setGraph] = useContext(GraphContext)!;
  const { Ws } = useContext(WsContext);
  let { events } = useContext(PageContext);
  const [tableStore, setTableStore] = createStore({} as { tableColumns: ColumnDef<any>[], data: Accessor<Vertex[]> });




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

  async function getTableData() {
    const form = await getFormApiFromForm(graph, setGraph, props.tableId);

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

    const deleteObject = (id: Id) => {
      if (confirm("Are you sure you want to delete this item?")) {
        const txnId = getNewTxnId();
        const deleteResult = deleteVertex(txnId, id, graph, setGraph);
        // @ts-ignore
        if (deleteResult?.error) {
          alert(data);
          return;
        }
        transactions.get(txnId)!.status = ProcessStatus.Ready;
        commitTransaction(Ws);
      }
    };

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
                  ? "true"
                  : info.getValue() === false
                    ? "false"
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
      accessorKey: "Edit",
      header: "",
      footer: "",
      cell: (info) => (
        <Show
          when={!formNew.isInlineEditable}
          fallback={
            <Modal
              info={info}
              graph={graph}
              setGraph={setGraph}
              tableId={props.tableId}
            />
          }
        >
          <A
            href={`${APP_BASE_URL}/${props.tableId}/${info.row.original.id}`}
            class="r:5|5|5|5 p:5"
          >
            <CustomButton variant={"custom"}>
              <Icon
                height={21}
                width={21}
                class={"color:#3477CC"}
                icon="fluent:edit-12-regular"
              />
            </CustomButton>
          </A>
        </Show>
      ),
    });
    tableColumns.push({
      accessorKey: "Delete",
      header: "",
      footer: "",
      cell: (info) => (
        <button
          onClick={/*@once*/ () => deleteObject(info.row.original.id as any)}
          class="text-fill:red font:semibold	"
        >
          <CustomButton variant={"custom"} class={"fg:rgb(252,0,0)"}>
            <Icon
              height={21}
              width={21}
              icon="fluent:delete-12-regular"
              class="color:red mr:1rem"
            />
          </CustomButton>
        </button>
      ),
    });

    const coll = isNumber(collection)
      ? graph.vertexes[collection].P[IdAttr]
      : collection;
    // if(!graph.vertexLabelIdMap[coll]) {
    //  alert(`collection not found ${coll}`)
    //  return;
    // }





    const [data] = createSignal(
      (graph.vertexLabelIdMap[coll] || []).map(
        (vertexId: any) => graph.vertexes[vertexId],
      ),
    );

    setTableStore({ tableColumns, data });
  }


  const [data, { mutate, refetch }] = createResource(async () => {
    try {
      await getTableData();
    } catch (e: any) {
      console.error(e);
    }
  });

  onCleanup(() => events?.setTitle(""));

  return (
    <div class="">
      <Switch>
        <Match when={data.loading}>
          Loading
        </Match>

        <Match when={data.error}>
          Error
        </Match>

        <Match when={true}>
          <CollapsibleTable headers={tableStore.tableColumns} rows={tableStore.data()} />
        </Match>
      </Switch>
    </div>
  );
};

export const AbstractSingleGrid = (props: AbstractSingleGridProps) => {
  const params = useParams();
  const [graph, setGraph] = useContext(GraphContext)!;
  const data = findVertexByLabelAndUniqueId(
    graph, "Coll",
    IdAttr,
    props.tableId,

  );

  const nestedName = createMemo(
    () =>
      findVertexByLabelAndUniqueId(graph, "Coll", IdAttr, props.tableId)?.P
        ?.name,
  );
  const navData = createMemo(() => {
    const nav = findVertexByLabelAndUniqueId(graph, "Nav", "name", "Navigation");
    if (!nav) return [];

    if (!graph.vertexes[nav.id]) {
      return;
    }

    const vertex = graph.vertexes[nav.id];

    const metaVertexResult = untrack(() => createMeta(AttrsAdminTableData["Nav"], graph, setGraph));

    if (metaVertexResult.error) {
      console.error(metaVertexResult.error);
      return;
    }
    const metaVertex = metaVertexResult.vertex!;

    const navData = renderNavTreeFromGraph(metaVertex, vertex, true, graph);
    const navigation = getParentFromNav(navData);
    return navigation;
  });

  const navigate = useNavigate();
  // used to refresh table:
  const [tableId, setTableId] = createSignal("");
  createEffect(() => {
    // clear the state when routes parameter changes.
    setTableId("");
    props.tableId;
    setTimeout(() => setTableId(props.tableId));
  });

  return (
    <>
      <PageHeader
        // @ts-ignore
        title={`${navData()?.child || nestedName() || ''}`}
        breadcrumb={[
          ...breadcrumbData,
          // @ts-ignore
          { name: navData()?.parent },
          // @ts-ignore
          { name: navData()?.child || nestedName() },
        ]}
      />
      <div class="flex justify-content:start p:5">
        <GenericField
          meta={
            {
              P: {
                component: "Button",
                [IdAttr]: "meta",
                props: {
                  onClick: () => navigate("new"),
                  variant: "soft",
                  style: { padding: "7px 10px" },
                  leading: (
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
      </div>
      <Show when={tableId()}>
        <DataGrid tableId={tableId()} />
      </Show>
    </>
  );
};

export function getParentFromNav(navData: any) {
  const param = useLocation();
  const dats = JSON.parse(JSON.stringify(navData));
  let result = {}; // Initialize an empty object to store the result
  dats.forEach((value: any) => {
    let data = {};
    let childName = null;
    if (value.children) {
      // @ts-ignore
      value.children.forEach((child) => {
        if (child.href && child.href === param.pathname) {
          data = child;
          childName = child.name;
        }
      });
      if (Object.entries(data).length > 0) {
        // @ts-ignore
        data["child"] = childName;
        // @ts-ignore
        data["parent"] = value.name;
        result = data; // Store the result in the object
      }
    }
  });

  return result;
}


export const TableDashboard = () => {
  const params = useParams();
  const [graph, setGraph] = useContext(GraphContext)!;
  const dashboard = findVertexByLabelAndUniqueId(
    graph, "Dashboard",
    IdAttr,
    params.name,
  );
  if (!dashboard) {
    return "No Dashboard Found";
  }
  const allFormTableLayouts =
    getChildVertexes(graph, ["$0Form"], [dashboard]).vertexes || [];
  const allCollTableLayouts =
    getChildVertexes(graph, ["$0Coll"], [dashboard]).vertexes || [];

  const allTableLayouts = () => [
    ...new Set([...allCollTableLayouts, ...allFormTableLayouts]),
  ];
  return (
    <div class="grid-cols:2 grid-cols:3@xs grid-cols:4@sm grid-cols:5@md gap:15 gap:20@sm">
      <For each={allTableLayouts()}>
        {(tableLayout) => (
          <div class="bg:gray-5 box-shadow:1|1|1|1|gray-20 pb:50 pt:50 r:7|7|7|7 r:10 flex">
            <h3 class="f:18@md font:semibold"></h3>
            <p class="mt:5 mb:0 mx:auto f:18@md font:semibold">
              <A href={`${APP_BASE_URL}/${tableLayout.P[IdAttr]}`}>
                {tableLayout.P.title || tableLayout.P[IdAttr]}
              </A>
            </p>
          </div>
        )}
      </For>
    </div>
  );
};

export const AllDashboards = () => {
  const [graph, setGraph] = useContext(GraphContext)!;
  const vertexes = () => graph.vertexLabelIdMap["Dashboard"] || [];
  return (
    <div class="">
      <For each={vertexes()}>
        {(vertexId) => (
          <A
            href={`${APP_BASE_URL}/grid/${graph.vertexes[vertexId].P[IdAttr]}`}
          >
            {graph.vertexes[vertexId].P[IdAttr]}
          </A>
        )}
      </For>
    </div>
  );
};
