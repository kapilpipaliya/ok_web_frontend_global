// Comment This Lines in web build
import DxDataGrid, { Column } from "devextreme/ui/data_grid";
import ArrayStore from "devextreme/data/array_store";
import DataSource from "devextreme/data/data_source";
import { DataType } from "devextreme/common";

import {
  commitTransaction,
  getNewTxnId,
  graph,
  Id,
  IdAttr,
  ProcessStatus,
  setGraph,
  transactions,
  Vertex
} from "../lib/graph";
import {
  createEffect,
  createSignal,
  For,
  getOwner,
  on,
  runWithOwner,
  Show,
  splitProps,
  useContext,
  onCleanup
} from "solid-js";
import { klona } from "klona";
import { Link, useNavigate, useParams } from "@solidjs/router";

import { WsContext } from "../utils/ws_events_dispatcher";
import { AttrsTableData } from "./api";
import {capitalizeFirstLetter, isNumber} from "../utils/utils";
import { deleteVertex, findVertexByLabelAndUniqueId } from "../lib/Vertex";

import {
  collectionNameDisplayExpr,
  selectedValue
} from "./input/SelectInputField";
import {getChildVertexes, getSelectionOptions} from "../lib/Traverse";
import { GenericField } from "./input/GenaricField";
import { FormMetaData, getFormApiFromForm, PageContext } from "../lib/Record";
import {AttrsAdminTableData} from "./apiAdmin";

export const SampleDataGrid = (props: {}) => {
  const data = [] as { [key: string]: any }[];
  const dataArrayStore = new ArrayStore({
    data: data,
    key: "id",
    onLoaded: function () {
      // ...
    },
  });

  const dataDataSource = new DataSource({
    store: dataArrayStore,
    // sort: "LastName"
  });
  for (const id of graph.vertexLabelIdMap["Attr"]) {
    dataArrayStore.insert(klona(graph.vertexes[id]));
  }
  for (const id of graph.vertexLabelIdMap["Attr"]) {
    // clone accesses every property -> subscribes to the whole store
    // update(v.id, v) gives error: Cannot mutate a Store directly, if we previously inserted proxy
    createEffect(
      on(
        () => klona(graph.vertexes[id]),
        (v) => {
          dataArrayStore.update(v.id, v);
          dataDataSource.reload();
        },
        { defer: true },
      ),
    );
  }
  setTimeout(() => {
    setGraph("vertexes", graph.vertexLabelIdMap["Attr"][0], "P", {
      id: "Kapil",
    });
  }, 3000);
  return (
    <div
      ref={(el) => {
        // @ts-ignore
        const instance = new DxDataGrid(el, {
          dataSource: dataDataSource,
          // keyExpr: 'id',
          columns: [
            {
              caption: "id",
              dataField: "id",
              dataType: "string",
              fixed: true,
              sortIndex: 0,
              width: 70,
            },
            {
              caption: "Name",
              dataField: `P.${IdAttr}`,
              dataType: "string",
              fixed: true,
            },
            {
              caption: "Label",
              dataField: "P.label",
              dataType: "string",
              fixed: true,
            },
            {
              caption: "Unique",
              dataField: "P.unique",
              dataType: "boolean",
              fixed: true,
            },
          ],
          allowColumnReordering: true,
          allowColumnResizing: true,
          columnAutoWidth: true,
          columnFixing: { enabled: true },
          columnChooser: { enabled: true },
          sorting: { mode: "multiple" },
          filterRow: { visible: true },
          searchPanel: { visible: true },
          groupPanel: { visible: true, emptyPanelText: "" },
          showBorders: true,
          rowAlternationEnabled: true,
          showRowLines: true,
          showColumnLines: true,
          width: "800",
        });
        onCleanup(() => instance.dispose());
      }}
    />
  );
};
interface DataGridProps {
  tableId: string;
}

// TODO: add filter like: https://js.devexpress.com/Demos/WidgetsGallery/Demo/FilterBuilder/WithDataGrid/jQuery/Light/
export const DataGrid = (props: DataGridProps) => {
  const form = getFormApiFromForm(props.tableId);
  let formNew: FormMetaData;
  let collection: string;

  if (form.error) {
    if (AttrsTableData[props.tableId] || AttrsAdminTableData[props.tableId]) {
      formNew = AttrsTableData[props.tableId] || AttrsAdminTableData[props.tableId];
      collection = props.tableId;
    } else {
      return form.error;
    }
  } else {
    formNew = form.form!;
    // @ts-ignore
    collection = form.form.collection as string;
  }
  console.log(formNew);

  const tableColumns = [] as Array<Column<any, any>>;
  for (const attribute of formNew!.attributes) {
    if (attribute.component === "Table") continue;
    // if (attribute.props?.skip) continue;
    attribute["dataField"] = `P.${attribute.name}`;
    attribute["caption"] = capitalizeFirstLetter(attribute.displayName || attribute.name);
    attribute["dataType"] = dataTypeToDataGrid(attribute.dataType!);
    if (attribute.component === "SelectBox" && !attribute.props.items) {
      attribute["calculateCellValue"] = (columnBase, rowData) => {
        const vertex = selectedValue(
          {
            P: attribute,
          } as unknown as Vertex,
          columnBase,
        );
        if (vertex[0]) {
          return getSelectionOptions([graph.vertexes[vertex[0]]], attribute.props?.displayExpr || collectionNameDisplayExpr(attribute.props?.collection) || `::'P.${IdAttr}'`).vertexes;
        }
        return "";
      };
    }
    if (attribute.component === "TagBox" && !attribute.props.items) {
      attribute["calculateCellValue"] = (columnBase, rowData) => {
        const vertex = selectedValue(
          {
            P: attribute,
          } as unknown as Vertex,
          columnBase,
        );
        if (vertex) {
          const textArray = [];
          for (const v of vertex) {
            const text = getSelectionOptions([graph.vertexes[v]], attribute.props?.displayExpr || `::'P.${IdAttr}'`).vertexes;
            textArray.push(text);
          }
          return textArray.join(', ');
        }
        return "";
      };
    }
    // @ts-ignore
    tableColumns.push(attribute);
  }

  if (!collection) {
    return <>Incorrect Configuration</>
  }
  // console.log(1, JSON.stringify(props))
  const { Ws } = useContext(WsContext);
  let { events } = useContext(PageContext);
  events?.setTitle(formNew.title);
  onCleanup(() => events?.setTitle(''));
  const data = [] as { [key: string]: any }[];
  const dataArrayStore = new ArrayStore({
    data: data,
    // if key is not found Grid will use unique UUID as key:
    key: "id",
    onLoaded: function () {
      // ...
    },
  });

  const dataDataSource = new DataSource({
    store: dataArrayStore,
    // sort: "LastName"
  });
  const coll = isNumber(collection) ? graph.vertexes[collection].P[IdAttr] : collection;
  // if(!graph.vertexLabelIdMap[coll]) {
  //  alert(`collection not found ${coll}`)
  //  return;
  // }
  for (const id of graph.vertexLabelIdMap[coll] || []) {
    dataArrayStore.insert(klona(graph.vertexes[id]));
  }
  for (const id of graph.vertexLabelIdMap[coll] || []) {
    // clone accesses every property -> subscribes to the whole store
    // update(v.id, v) gives error: Cannot mutate a Store directly, if we previously inserted proxy
    createEffect(
      on(
        () => klona(graph.vertexes[id]),
        (v) => {
          // when we save a form, sometimes graph.vertexes[id] returns undefined.
          if (!v) return;
          dataArrayStore.update(v.id, v);
          dataDataSource.reload();
        },
        { defer: true },
      ),
    );
  }
  const [_, customProps] = splitProps(props, ["tableId"]);

  return (
    <div class="py:5"
      ref={(el) => {
        const owner = getOwner();

        const template = function (cellElement, cellInfo) {
          return runWithOwner(owner, () => (
            <span>
              <Link href={/*@once*/ `/${props.tableId}/${cellInfo.row.key}`}>Edit</Link>
              <button onClick={/*@once*/ () => deleteObject(/*@once*/ cellInfo.row.key)}>Delete</button>
            </span>
          ));
        };
        // @ts-ignore
        const instance = new DxDataGrid(el, {
          dataSource: dataDataSource,
          // keyExpr: 'id',
          columns: [
            ...tableColumns,
            {
              type: "buttons",
              buttons: [
                "edit",
                "delete",
                {
                  template,
                },
              ],
            },
          ],
          allowColumnReordering: true,
          allowColumnResizing: true,
          columnAutoWidth: true,
          columnFixing: { enabled: true },
          columnChooser: { enabled: true },
          sorting: { mode: "multiple" },
          filterRow: { visible: true },
          searchPanel: { visible: true },
          groupPanel: { visible: true, emptyPanelText: "" },
          showBorders: true,
          rowAlternationEnabled: true,
          showRowLines: true,
          showColumnLines: true,
          paging: {
            pageSize: 25,
          },
          export: {
            enabled: true,
          },
          cellHintEnabled: true,
          showColumnHeaders: true,
          ...customProps,
        });
        const deleteObject = (id: Id) => {
          if (confirm("are you sure")) {
            const txnId = getNewTxnId();
            const deleteResult = deleteVertex(txnId, id);
            // @ts-ignore
            if (deleteResult?.error) alert(data);
            else {
              dataArrayStore.remove(id);
              dataDataSource.reload();
            }
            transactions.get(txnId)!.status = ProcessStatus.Ready;
            commitTransaction(Ws);
          }
        };
        onCleanup(() => instance.dispose());
      }}
    />
  );
};

interface AbstractSingleGridProps {
  tableId: string;
}

export const AbstractSingleGrid = (props: AbstractSingleGridProps) => {
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
      <div>
        <GenericField
          meta={
            {
              P: {
                component: "Button",
                [IdAttr]: "meta",
                props: {},
              },
            } as unknown as Vertex
          }
          data={{ P: { meta: "Add new" } } as unknown as Vertex}
          onClick={() => {
            navigate("./new");
          }}
        />
      </div>
      <Show when={tableId()}>
        <DataGrid tableId={tableId()} />
      </Show>
    </>
  );
};

export const TableDashboard = () => {
  const params = useParams();
  const dashboard = findVertexByLabelAndUniqueId('Dashboard',IdAttr, params.name);
  if (!dashboard) {
    return "No Dashboard Found";
  }
  const allFormTableLayouts = getChildVertexes(['$0Form'], [dashboard]).vertexes || [];
  const allCollTableLayouts = getChildVertexes(['$0Coll'], [dashboard]).vertexes || [];

  const allTableLayouts = () => [...new Set([...allCollTableLayouts, ...allFormTableLayouts])];
  return (
    <div class="">
      <div class="grid-cols:2 grid-cols:3@xs grid-cols:4@sm grid-cols:5@md gap:15 gap:20@sm">
          <For each={allTableLayouts()}>
            {(tableLayout) => (
             <div class="bg:gray-22 p:10 r:10 max-w:350 bg:gray-28:hover flex ji:center ai:center h:5rem">
               <h3 class="f:18@md font:semibold"></h3>
               <p class="mt:5 mb:0 mx:auto f:18@md font:semibold"><Link href={`/${tableLayout.P[IdAttr]}`}>{tableLayout.P.title || tableLayout.P[IdAttr]}</Link></p>
             </div>
            )}
          </For>
      </div>
    </div>
  );
};

export const AllDashboards = () => {
  const vertexes = () => graph.vertexLabelIdMap["Dashboard"]|| [];

  return (
   <div class="">
     <For each={vertexes()}>{(vertexId) => <Link href={`/grid/${graph.vertexes[vertexId].P[IdAttr]}`}>{graph.vertexes[vertexId].P[IdAttr]}</Link>}</For>
   </div>
  );
}
const dataTypeToDataGrid = (type: string): DataType => {
  switch (type) {
    case "String":
      return "string";
    case "Boolean":
      return "boolean";
    case "Integer":
      return "number";
    case "Float":
      return "number";
    case "List":
      return "object";
    case "Map":
      return "object";
    case "Duration":
      return "string";
    case "Date":
      return "datetime";
    case "LocalTime":
      return "datetime";
    case "LocalDateTime":
      return "datetime";
    default:
      return "string";
  }
};
