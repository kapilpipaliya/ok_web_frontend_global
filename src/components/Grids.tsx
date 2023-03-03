import DxDataGrid, { Column } from "devextreme/ui/data_grid";
import ArrayStore from "devextreme/data/array_store";
import DataSource from "devextreme/data/data_source";
import {
 commitTransaction,
 getNewTxnId,
 graph,
 ProcessStatus,
 setGraph,
 transactions
} from "../lib/graph";
import {
 Id
} from "./input/Form";
import { createEffect, For, on, splitProps, useContext } from "solid-js";
import { klona } from "klona";
import { Link, useNavigate } from "solid-app-router";

import { G } from "@mobily/ts-belt";

import { deleteVertex } from "../lib/Vertex";
import { WsContext } from "./ws_events_dispatcher";
import './Grid.css'
import { getFormApiFromFormLayout } from "./Froms";
export const SampleDataGrid = (props: {}) => {
 const data = [] as {[key: string]: any}[];
 const dataArrayStore = new ArrayStore({
  data: data,
  key: "id",
  onLoaded: function() {
   // ...
  }
 });

 const dataDataSource = new DataSource({
  store: dataArrayStore,
  // sort: "LastName"
 });
 for(const id of graph.vertexLabelIdMap["Attribute"]) {
  dataArrayStore.insert(klona(graph.vertexes[id]))
 }
 for(const id of graph.vertexLabelIdMap["Attribute"]) {
  // clone accesses every property -> subscribes to the whole store
  // update(v.id, v) gives error: Cannot mutate a Store directly, if we previously inserted proxy
  createEffect(on(() => klona(graph.vertexes[id]), (v) => {
   dataArrayStore.update(v.id, v);
   dataDataSource.reload();
  }, {defer: true}));
 }
 setTimeout(()=>{
  setGraph('vertexes', graph.vertexLabelIdMap["Attribute"][0], 'properties', {id: "Kapil"});
 }, 3000);
 return <div ref={el => {
  // @ts-ignore
  const instance = new DxDataGrid(el, {
   dataSource: dataDataSource,
   // keyExpr: 'id',
   columns: [
    {caption: "id", dataField: "id", dataType: "string", fixed: true, sortIndex: 0, width: 70},
    {caption: "ID", dataField: "properties.id", dataType: "string", fixed: true},
    {caption: "Label", dataField: "properties.label", dataType: "string", fixed: true},
    {caption: "Unique", dataField: "properties.unique", dataType: "boolean", fixed: true},
   ],
   allowColumnReordering: true,
   allowColumnResizing: true,
   columnAutoWidth: true,
   columnFixing: { enabled: true },
   columnChooser: { enabled: true },
   sorting: { mode: "multiple" },
   filterRow: { visible: true },
   searchPanel: { visible: true },
   groupPanel: { visible: true, emptyPanelText: '' },
   showBorders: true,
   rowAlternationEnabled: true,
   showRowLines: true,
   showColumnLines: true,
   width: '800',
  });
 }}/>
}
interface DataGridProps {
 columns:  Array<Column<any, any>>;
 collection: string;
}

export const DataGrid = (props: DataGridProps) => {
 if(!props.collection) {
  return <>Incorrect Configuration</>
 }
 // console.log(1, JSON.stringify(props))
 const {Ws} = useContext(WsContext);
 const data = [] as {[key: string]: any}[];
 const dataArrayStore = new ArrayStore({
  data: data,
  key: "id",
  onLoaded: function() {
   // ...
  }
 });

 const dataDataSource = new DataSource({
  store: dataArrayStore,
  // sort: "LastName"
 });
 const coll = G.isNumber(props.collection) ? graph.vertexes[props.collection].properties.id : props.collection
 // if(!graph.vertexLabelIdMap[coll]) {
 //  alert(`collection not found ${coll}`)
 //  return;
 // }
 for(const id of graph.vertexLabelIdMap[coll] || []) {
  dataArrayStore.insert(klona(graph.vertexes[id]))
 }
 for(const id of graph.vertexLabelIdMap[coll] || []) {
  // clone accesses every property -> subscribes to the whole store
  // update(v.id, v) gives error: Cannot mutate a Store directly, if we previously inserted proxy
  createEffect(on(() => klona(graph.vertexes[id]), (v) => {
   // when we save a form, sometimes graph.vertexes[id] returns undefined.
   if(!v) return;
   dataArrayStore.update(v.id, v);
   dataDataSource.reload();
  }, {defer: true}));
 }
 const [p, customProps] = splitProps(props, ['collection', 'columns'])

 return <div ref={el => {
  // @ts-ignore
  const instance = new DxDataGrid(el, {
   dataSource: dataDataSource,
   // keyExpr: 'id',
   columns: [...p.columns, {
    type: "buttons",
    buttons: ["edit", "delete", {
     template: function (cellElement, cellInfo) {
      return <span><a href={/*@once*/ `${location.pathname}/${cellInfo.row.key}`}>Edit</a>
   <button onClick={/*@once*/ () => deleteObject(/*@once*/cellInfo.row.key)}>Delete
   </button>
  </span>;
     }}]}
    ],
   allowColumnReordering: true,
   allowColumnResizing: true,
   columnAutoWidth: true,
   columnFixing: { enabled: true },
   columnChooser: { enabled: true },
   sorting: { mode: "multiple" },
   filterRow: { visible: true },
   searchPanel: { visible: true },
   groupPanel: { visible: true, emptyPanelText: '' },
   showBorders: true,
   rowAlternationEnabled: true,
   showRowLines: true,
   showColumnLines: true,
   ...customProps
  });
  const deleteObject = (id: Id) => {
   if (confirm("are you sure")) {
    const txnId = getNewTxnId();
    const deleteResult = deleteVertex(txnId, id);
    // @ts-ignore
    if (deleteResult?.error) alert(data.message);
    else {
     dataArrayStore.remove(id);
     dataDataSource.reload();
    }
    transactions.get(txnId)!.status = ProcessStatus.Ready;
    commitTransaction(Ws);
   }
  };
 }}/>
}
interface AbstractSingleGridProps {
 tableId: string;
}

export const AbstractSingleGrid = (props: AbstractSingleGridProps) => {
 const form = getFormApiFromFormLayout(props.tableId);
 if(form.error) return form.error;
 console.log(form);
 // @ts-ignore
 const collection = form.form.collection as string;

 const tableColumns = [];
 for (const attribute of form.form!.attributes) {
  if(attribute.component === "Table") continue;
  // @ts-ignore
  attribute['dataField'] = `properties.${attribute.id}`;
  // @ts-ignore
  attribute['caption'] = attribute.title;
  attribute['dataType'] = dataTypeToDataGrid(attribute.dataType!);
  tableColumns.push(attribute);
 }

 const [_selectedProps, customProps] = splitProps(props, ['tableId']);

 const navigate = useNavigate();
 return <div class="">
  <div>
   <button onClick={() => navigate("./new")}>
    Add new
   </button>
  </div>
  {/* @ts-ignore*/}
  <DataGrid collection={collection} columns={tableColumns} {...customProps}/>
 </div>
}

export const TableDashboard = () => {
 const allTableLayouts = () => graph.vertexLabelIdMap["FormLayout"]?.map(formLayoutVertex => graph.vertexes[formLayoutVertex]).filter(v => v.properties.table) || [];

 return <div class="index">
  <div class="title">
   <div class="block-content main-sections">
    <For each={allTableLayouts()}>
     {tableLayout => <div class="content-item"> <Link href={`/${tableLayout.properties.id}`}>  <div>
     </div>  <h3 class="multi-line">{tableLayout.properties.title || tableLayout.properties.id}</h3>  </Link>
     </div>}
    </For>
    <div class="content-item"></div>
    <div class="content-item"></div>
    <div class="content-item"></div>
    <div class="content-item"></div>
   </div>
  </div>
 </div>
}
const dataTypeToDataGrid = (type: string) => {
 switch (type) {
  case 'String': return 'string'
  case 'Boolean': return 'boolean'
  case 'Integer': return 'number'
  case 'Float': return 'number'
  case 'List': return 'object'
  case 'Map': return 'object'
  case 'Duration': return 'string'
  case 'Date': return 'datetime'
  case 'LocalTime': return 'datetime'
  case 'LocalDateTime': return 'datetime'
  default: return 'string';
 }
}