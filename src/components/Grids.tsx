import DxDataGrid, { Column } from "devextreme/ui/data_grid";
import ArrayStore from "devextreme/data/array_store";
import DataSource from "devextreme/data/data_source";

import {
  commitTransaction,
  getNewTxnId,
  graph,
  Id,
  ProcessStatus,
  setGraph,
  transactions,
  Vertex
} from "../lib/graph";
import {
  createEffect,
  createSignal,
  For, getOwner,
  on,
  runWithOwner,
  Show,
  splitProps,
  useContext
} from "solid-js";
import { klona } from "klona";
import { Link, useNavigate } from "@solidjs/router";

import { G } from "@mobily/ts-belt";
import { WsContext } from "./ws_events_dispatcher";
import "./Grid.css";
import { FormMetaData, getFormApiFromForm } from "./Form";
import { AttrsTableData } from "./api";
import { capitalizeFirstLetter } from "../utils/utils";
import { deleteVertex } from "../lib/Vertex";
import { ButtonField } from "./core/Button";
import { DataType } from "devextreme/common";
import { selectedValue } from "./input/SelectInputField";
import { getOptionLabel } from "../lib/Traverse";

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
    setGraph("vertexes", graph.vertexLabelIdMap["Attr"][0], "properties", {
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
              caption: "ID",
              dataField: "properties.id",
              dataType: "string",
              fixed: true,
            },
            {
              caption: "Label",
              dataField: "properties.label",
              dataType: "string",
              fixed: true,
            },
            {
              caption: "Unique",
              dataField: "properties.unique",
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
    if (AttrsTableData[props.tableId]) {
      formNew = AttrsTableData[props.tableId];
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
    if (attribute.component === "TableField") continue;
    if (attribute.props?.skip) continue;
    attribute["dataField"] = `properties.${attribute.id}`;
    attribute["caption"] = capitalizeFirstLetter(attribute.title || attribute.id);
    attribute["dataType"] = dataTypeToDataGrid(attribute.dataType!);
    if (attribute.component === "SelectBoxField") {
      attribute['calculateCellValue'] = (columnBase, rowData) => {
        const vertex = selectedValue(       {
          properties: attribute
        } as unknown as Vertex, columnBase);
        if (vertex[0]) {
          return getOptionLabel(graph.vertexes[vertex], attribute.props?.displayExpr || "properties.id")
        }
        return ''
      }
    }
    // @ts-ignore
    tableColumns.push(attribute);
  }

  if (!collection) {
    return <>Incorrect Configuration</>;
  }
  // console.log(1, JSON.stringify(props))
  const { Ws } = useContext(WsContext);
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
  const coll = G.isNumber(collection) ? graph.vertexes[collection].properties.id : collection;
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
    <div
      ref={(el) => {
        const owner = getOwner();

        const template = function(cellElement, cellInfo) {
          return runWithOwner(owner, () => (
           <span>
             <Link
              href={/*@once*/ `/${props.tableId}/${cellInfo.row.key}`}>Edit</Link>
             <button
              onClick={/*@once*/ () => deleteObject(/*@once*/ cellInfo.row.key)}>Delete</button>
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
                  template
                }
              ]
            }
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
            pageSize: 25
          },
          ...customProps
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
   <div class="">
     <div>
       <ButtonField
        meta={{
          properties: {
            id: "meta",
            props: {}
          }
        } as unknown as Vertex}
        data={{ properties: { meta: "Add new" } } as unknown as Vertex}
        onClick={() => {
          navigate("./new");
        }} />
     </div>
     <Show when={tableId()}>
       <DataGrid tableId={tableId()} />
     </Show>
   </div>
  );
};

export const TableDashboard = () => {
  const allFormTableLayouts = ():Vertex[] =>
   graph.vertexLabelIdMap["Form"]
    ?.map((formLayoutVertex) => graph.vertexes[formLayoutVertex])
    .filter((v) => v.properties.table) || [];

  const allCollTableLayouts = ():Vertex[] =>
   graph.vertexLabelIdMap["Coll"]
    ?.map((formLayoutVertex) => graph.vertexes[formLayoutVertex])
    .filter((v) => v.properties.table) || [];

  const allTableLayouts = () => [...new Set([...allCollTableLayouts(), ...allFormTableLayouts()])]
  return (
   <div class="index">
     <div class="title">
       <div class="block-content main-sections">
         <For each={allTableLayouts()}>
           {(tableLayout) => (
            <div class="content-item">
              {" "}
              <Link href={`/${tableLayout.properties.id}`}>
                {" "}
                <div></div>
                <h3 class="multi-line">
                  {tableLayout.properties.title || tableLayout.properties.id}
                </h3>{" "}
              </Link>
            </div>
           )}
         </For>
         <div class="content-item"></div>
         <div class="content-item"></div>
         <div class="content-item"></div>
         <div class="content-item"></div>
       </div>
     </div>
   </div>
  );
};
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
