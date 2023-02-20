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
 Id,
} from "./input/Form";
import { createEffect, For, on, splitProps, useContext } from "solid-js";
import { klona } from "klona";
import { Link, useNavigate } from "solid-app-router";
import { removeUndefinedProperties } from "../utils/functions";

import { G } from "@mobily/ts-belt";

import { deleteVertex } from "../lib/Vertex";
import { WsContext } from "./ws_events_dispatcher";
import './Grid.css'
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
 const tableLayoutId = () => graph.vertexLabelIdMap["TableLayout"].find(vertexId => graph.vertexes[vertexId].properties['id'] === props.tableId)
 const tableLayout = graph.vertexes[props.tableId] || graph.vertexes[tableLayoutId()!];
 if(!tableLayout) {
  return <>Incorrect Configuration</>
 }
 const tableLayoutHasAttributes = (tableLayout.out_edges["TableLayoutHasAttribute"] || []).map(edge=>graph.edges[edge]).sort((a,b)=>a.properties.pos - b.properties.pos);

 const generateNewApi = () => {
  const tables = tableLayoutHasAttributes.map(edgeTableLayoutHasAttribute=> {
   const vertexAttribute = graph.vertexes[edgeTableLayoutHasAttribute.end];
   const attributeProperties = Object.assign({}, removeUndefinedProperties(vertexAttribute.properties, false, 10), removeUndefinedProperties(edgeTableLayoutHasAttribute.properties, false, 10));
   if(attributeProperties.meta) {
    // const meta = evalImpl(attributeProperties.meta);
    // if(G.isObject(meta)){
    //  Object.assign(attributeProperties, meta);
    //  delete attributeProperties.meta;
    // }
   }
   const {id, code, component, default: default_, dataType, label, disabled, onChange, props, readonly, required, unique, ...customAttributeProperties} = attributeProperties;
   //  {caption: "id", dataField: "id", dataType: "string", fixed: true, sortIndex: 0, width: 70},
   customAttributeProperties['dataField'] = `properties.${id}`;
   customAttributeProperties['caption'] = label;
   customAttributeProperties['dataType'] = dataTypeToDataGrid(graph.vertexes[dataType].properties.id);
   return {...customAttributeProperties}
  })
  return tables;
 }
 const tableColumns = generateNewApi();

 const [_selectedProps, customProps] = splitProps(props, ['tableId']);
 const {id, ...tableLayoutProperties} = tableLayout.properties;
 if(tableLayoutProperties.meta) {
  // const meta = evalImpl(tableLayoutProperties.meta);
  // if(G.isObject(meta)){
  //  Object.assign(tableLayoutProperties, meta);
  //  delete tableLayoutProperties.meta;
  // }
 }
 const navigate = useNavigate();
 return <div class="">
  <div>
   <button onClick={() => navigate("./new")}>
    Add new
   </button>
  </div>
  {/* @ts-ignore*/}
  <DataGrid columns={tableColumns} {...tableLayoutProperties} {...customProps} />
 </div>
}

export const TableDashboard = () => {
 const allTableLayouts = () => graph.vertexLabelIdMap["TableLayout"]?.map(tableLayoutVertex => graph.vertexes[tableLayoutVertex]) || [];

 return <div class="index">
  <div class="title">
   <div class="block-content main-sections">
    <For each={allTableLayouts()}>
     {tableLayout => <div class="content-item"> <Link href={`/${tableLayout.properties.id}`}>  <div>
     </div>  <h3 class="multi-line">{tableLayout.properties.label || tableLayout.properties.id}</h3>  </Link>
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