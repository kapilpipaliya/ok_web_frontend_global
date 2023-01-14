import DxDataGrid from 'devextreme/ui/data_grid'
import ArrayStore from "devextreme/data/array_store";
import DataSource from "devextreme/data/data_source";
import { graph, setGraph } from "../lib/graph";
import {
 VertexLabels
} from "../../../ok_web_components/src/components/input/Form";
import { createEffect, on } from "solid-js";
import { klona } from "klona";
export const DataGrid = (props: {}) => {
 const data = [];
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
 for(const id of graph.vertexLabelIdMap[VertexLabels.Attribute]) {
  dataArrayStore.insert(klona(graph.vertexes[id]))
 }
 for(const id of graph.vertexLabelIdMap[VertexLabels.Attribute]) {
  // clone accesses every property -> subscribes to the whole store
  // update(v.id, v) gives error: Cannot mutate a Store directly, if we previously inserted proxy
  createEffect(on(() => klona(graph.vertexes[id]), (v) => {
   dataArrayStore.update(v.id, v);
   dataDataSource.reload();
  }, {defer: true}));
 }
 setTimeout(()=>{
  setGraph('vertexes', graph.vertexLabelIdMap[VertexLabels.Attribute][0], 'properties', {id: "Kapil"});
 }, 3000);
 return <div ref={el => {
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
   width: '800'
  });
 }}/>
}

export const TableDashboard = (props: {}) => {
 // todo: display a dashboard of all the Table Layouts
 // on click of it display data grid for it.
 return <></>
}