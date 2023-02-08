import { getNewGraphId, graph } from "../lib/graph";
import { batch } from "solid-js";

import {
  FormMetaData,
  FormResult,
  Id, Vertex
} from "./input/Form";
import { klona } from "klona/json";
import { A, D } from "@mobily/ts-belt";
import { Icon } from "@iconify-icon/solid";

import {
  addNewEdge,
  deleteEdge,
  getOutEdgeIdsOfType,
  newEdge, replaceEdgeEnd,
  replaceEdgeProperties, replaceEdgeStart,
} from "../lib/Edge";

/* use in c++
export const JSONToCypherMap = (json: object) => {
  // https://stackoverflow.com/questions/20841571/how-to-solve-the-dilemma-while-handle-json-in-neo4j-cypher
  return jju.stringify(json, { quote: "'" }).replace(/"/g, "\\x22");
};
*/
export function saveTableDataToEdge(txnId: number, tableData: {[key: string]: any}[], results: FormResult, edge: string, endIdAttribute: string) {
  if(tableData.some(row=>!row.id)){
    return { error: "Save Edge Id must no be undefined." };
  }
  const normalizedEdgesValue = tableData.reduce<Map<Id, {[key: string]: any}>>((acc, curr) => {
    acc.set(curr.id, D.deleteKeys(klona(curr), ["id", "_id"]));
    return acc;
  }, new Map<Id, {[key: string]: any}>());

  // remove rows that doesn't set endIdAttribute
  const endIdExist = (id: Id) => !!normalizedEdgesValue.get(id)!["properties"][endIdAttribute];

  const allIdsOriginal = [...normalizedEdgesValue.keys()];
  const allIds = allIdsOriginal.filter(id => endIdExist(id))
  const existingAttributeEdgeIds = getOutEdgeIdsOfType(results.get("0")!.id, edge);

  const deletedAttributeIds = A.difference(existingAttributeEdgeIds, allIds);
  const insertedAttributeIds = A.difference(allIds, existingAttributeEdgeIds);
  const updatedAttributeIds = A.intersection(allIds, existingAttributeEdgeIds);

  const result = new Map<Id,Id>();
  // return same id for rows that doesn't set endIdAttribute
  for(const id of allIdsOriginal) if (!endIdExist(id)) result.set(id, id);

  batch(() => {
    deletedAttributeIds.forEach(id => deleteEdge(txnId, id));
    insertedAttributeIds.forEach(id => {
      const newId = getNewGraphId();
      const { error } = addNewEdge(txnId, newEdge(newId, edge, D.deleteKeys(normalizedEdgesValue.get(id)!["properties"], [endIdAttribute]), results.get("0")!.id, normalizedEdgesValue.get(id)!["properties"][endIdAttribute]));
      if (error) alert(error);
      result.set(id, newId);
    });
    updatedAttributeIds.forEach(id => {
      const { error: error1 } = replaceEdgeProperties(txnId, id, D.deleteKeys(normalizedEdgesValue.get(id)!["properties"], [endIdAttribute]));
      if (error1) alert(error1);
      const { error: errorStartId } = replaceEdgeStart(txnId, id, results.get("0")!.id);
      if (errorStartId) alert(errorStartId);
      const { error: errorEndId } = replaceEdgeEnd(txnId, id, normalizedEdgesValue.get(id)!["properties"][endIdAttribute]);
      if (errorEndId) alert(errorEndId);
      result.set(id, id);
    });
  });

  return allIdsOriginal.map(id=>result.get(id));
}
function saveFormLayoutTableDataToEdge(txnId: number, tableData: any[], results: FormResult, edge: string) {
  if(tableData.some(row=>!row.id)){
    return { error: "Save Edge Id must no be undefined." };
  }
  const normalizedEdgesValue = tableData.reduce<Map<Id, {[key: string]: any}>>((acc, curr) => {
    acc.set(curr.id, D.deleteKeys(klona(curr), ["id", "_id"]));
    return acc;
  }, new Map<Id, {[key: string]: any}>());

  // remove rows that doesn't set end value set
  const endIdExist = (id: Id) => !!normalizedEdgesValue.get(id)!['end'];

  const allIdsOriginal = [...normalizedEdgesValue.keys()];
  const allIds = allIdsOriginal.filter(id => endIdExist(id))
  const existingAttributeEdgeIds = getOutEdgeIdsOfType(results.get("0")!.id, edge);

  const deletedAttributeIds = A.difference(existingAttributeEdgeIds, allIds);
  const insertedAttributeIds = A.difference(allIds, existingAttributeEdgeIds);
  const updatedAttributeIds = A.intersection(allIds, existingAttributeEdgeIds);

  const result = new Map<Id,Id>();
  // return same id for rows that doesn't set endIdAttribute
  for(const id of allIdsOriginal) if (!endIdExist(id)) result.set(id, id);

  batch(() => {
    deletedAttributeIds.forEach(id => deleteEdge(txnId, id));
    insertedAttributeIds.forEach(id => {
      const newId = getNewGraphId();
      const { error } = addNewEdge(txnId, newEdge(newId, edge, normalizedEdgesValue.get(id)!["properties"], results.get("0")!.id, normalizedEdgesValue.get(id)!["end"]));
      if (error) alert(error);
      result.set(id, newId);
    });
    updatedAttributeIds.forEach(id => {
      const { error: error1 } = replaceEdgeProperties(txnId, id, normalizedEdgesValue.get(id)!["properties"]);
      if (error1) alert(error1);
      const { error: errorStartId } = replaceEdgeStart(txnId, id, results.get("0")!.id);
      if (errorStartId) alert(errorStartId);
      const { error: errorEndId } = replaceEdgeEnd(txnId, id, normalizedEdgesValue.get(id)!["end"]);
      if (errorEndId) alert(errorEndId);
      result.set(id, id);
    });
  });

  return allIdsOriginal.map(id=>result.get(id));
}

function tableOverwriteDefaultValueFn() {
  return (joinVertex: Vertex, key: string) => {
    const value = graph.vertexes[joinVertex.properties.attribute]?.[key];
    if (typeof value === "boolean") {
      return value === true ? "true" : "false";
    } else if (key === "serverType") {
      return value ? graph.vertexes[value]["properties"]["id"] : "";
    } else if (key === "component") {
      return value ? graph.vertexes[value]["properties"]["id"] : "";
    } else if (key === "props") {
      return <span title={JSON.stringify(value)}><Icon icon="ion:information-circle-outline" /></span>;
    } else if (key === "relation") {
      return <span title={JSON.stringify(value)}><Icon icon="ion:information-circle-outline" /></span>;
    } else {
      return JSON.stringify(value);
    }
  };
}

export const AttributesTableData: {[key: string]: FormMetaData} = {
    "DataType":
        {
          id: "0",
          title: "DataType",
          label: "DataType",
          attributes: [
            { id: "id", serverType: "String" },
            {
              id: "default",
              component: "Select",
              displayExpr: "properties.id",
              collection: "Component",
            },
            {
              id: "Component",
              component: "Tag",
              displayExpr: "properties.id",
              collection: "Component",
            }
          ]
        },

    "Component": { id: "0", title: "Component", label: "Component", attributes: [{ id: "id", serverType: "String" }] },

    "Attribute": {
        id: "0", title: "Attribute", label: "Attribute", attributes: [
          { id: "id", serverType: "String" },
          {
            id: "serverType",
            component: "Select",
            displayExpr: "properties.id",
            collection: "DataType",
            onchange: '["component",null]',
            // onchange: (formGroup, value) => {
            //   formGroup.controls["component"].setValue(null);
            // }
          },
          {
            id: "component",
            component: "Select",
            collection: "(serverType)->[DataTypeComponent]",
            displayExpr: "properties.id",
          },
          { id: "label", serverType: "String" },
          // { id: "internal", type: "Boolean" },
          { id: "unique", serverType: "Boolean" },
          { id: "required", serverType: "Boolean" },
          { id: "readonly", serverType: "Boolean" },
          { id: "disabled", serverType: "Boolean" },
          // { id: "internal", type: "Boolean" },
          // { id: "default", serverType: "Map" }, // TODO: make a function, that accept value and based on serverType display different component (and convert to value in new type).
          // { id: "onChange", component: "JsCode" },
          // { id: "props", component: "JsCode" },
          // {
          //   id: "code",
          //   component: "JsCode",
          //   props: { placeholder: "write attributes for non base field" }
          // },
          // { id: "meta", component: "JsCode" }
        ],
      },
    "CollectionCategory": {
        id: "0",
        title: "Collection Category",
        label: "CollectionCategory",
        attributes: [
          { id: "id", serverType: "String" },
          { id: "description", component: "TextArea" }
        ]
      },

   // TODO: Collection has only one attribute. Add validation for that.
    "Collection":{
        id: "0",
        title: "Collection1",
        label: "Collection",
        attributes: [
          { id: "id", serverType: "String" },
          {
            id: "category",
            component: "Select",
            collection: "CollectionCategory",
            displayExpr: "properties.id",
          },
          { id: "description", component: "TextArea" },
          {
            id: "Attribute",
            label: "Collection",
            component: "Table",
            defaultValue: "undefined",
            // save: ["edge", "CollectionHasAttribute"],
            // data: (mainId) => {
            //   const AttributeEdges = getOutEdgeIdsOfType(mainId, "CollectionHasAttribute").map(edge =>
            //    graph.edges[edge]).sort((a, b) => a.properties.pos - b.properties.pos);
            //   return {properties: {CollectionHasAttribute: AttributeEdges.map(edge=>({
            //         ...edge, properties: {...edge.properties, attribute: edge.end}, _id: edge.id
            //   }))}}
            // },
            // save: (txnId, results, tableData)=>{
            //   const edge = "CollectionHasAttribute";
            //   const endIdAttribute = "attribute";
            //   return saveTableDataToEdge(txnId, tableData, results, edge, endIdAttribute);
            // },
            // defaultValueFn: tableOverwriteDefaultValueFn(),
            attributes: [
              {
                id: "attribute",
                component: "Select",
                collection: "Attribute",
                displayExpr: "properties.id",
                noOverWrite: true,
              },

              { id: "id", serverType: "String" },
              // { id: "selector", type: "String"},
              {
                id: "serverType",
                component: "Select",
                collection: "DataType",
                displayExpr: "properties.id",
                noInput: true,
                disabled: true,
              },
              {
                id: "component",
                component: "Select",
                displayExpr: "properties.id",
                collection: "(attribute:properties.serverType)->[DataTypeComponent]",
              },
              { id: "label", serverType: "String" },
              // { id: "internal", type: "Boolean" },
              { id: "unique", serverType: "Boolean" },
              { id: "required", serverType: "Boolean" },
              { id: "readonly", serverType: "Boolean" },
              { id: "disabled", serverType: "Boolean" },
              { id: "default", serverType: "Map" }, // TODO: make a function, that accept value and based on serverType display different component (and convert to value in new type).
              { id: "onChange", component: 'JsCode' },
              { id: "props", component: 'JsCode' },
              { id: "code", component: 'JsCode' },
              { id: "meta", component: 'JsCode' },
            ],

          },
          {
            id: "2",
            component: "Table",
            edge: "CollectionHasChild",
            defaultValue: "undefined",
            // data: (mainId) => {
            //   const AttributeEdges = getOutEdgeIdsOfType(mainId, "CollectionHasChild").map(edge =>
            //    graph.edges[edge]).sort((a, b) => a.properties.pos - b.properties.pos);
            //   return AttributeEdges.map(edge => ({
            //     ...edge,
            //     properties: { ...edge.properties, collection: edge.end },
            //     _id: edge.id
            //   }));
            // },
            // save: (txnId, results, tableData) => {
            //   const edge = "CollectionHasChild";
            //   const endIdAttribute = "collection";
            //   return saveTableDataToEdge(txnId, tableData, results, edge, endIdAttribute);
            // },
            attributes: [
              {
                id: "pos",
                serverType: "Integer",
                // default: (formValues, control) => (control as ReturnType<typeof createFormArray>).controls.length + 1,
                hidden: true
              },
              {
                id: "collection",
                component: "Select",
                collection: "Collection",
                displayExpr: "properties.id",
              },
              {
                id: "type",
                component: "TextInput"
              }
            ]
          }
        ]
      },
    "FormLayoutItem": {
        id: "0", title: "FormLayoutItem1", label: "FormLayoutItem", attributes: [
          { id: "id", serverType: "String" },
          // TODO: make title required
          { id: "title", serverType: "String" },
          { id: "description", component: "TextArea" },
          { id: "component", serverType: "String" },
          {
            id: "labelType",
            component: "Select",
            displayExpr: "id",
            collection: '[{"id":"vertex"},{"id":"edge"}]'
          },
          { id: "labelName", component: "Select",
          collection: "Collection",
             displayExpr: "properties.id", },
          { id: "meta", component: "JsCode", props: { placeholder: "({})" } },
          // { id: "buttongroup", component: "buttongroup", buttons: [{design: "Default", children: "OK", class: "mr-2"}, {design: "Negative", children: "Cancel"}] },
        {
          id: "1",
          title: "",
          label: "",
          // save: ["edge", "FormLayoutItemHasCollection", (results)=>results.get('0')?.id, (results, formValue)=>formValue['collection']],
          // data: (id)=>{
          //   if(id){
          //     const formVertex = graph.vertexes[id];
          //     const collectionEdges = formVertex.out_edges["FormLayoutItemHasCollection"]
          //     if(collectionEdges && collectionEdges[0]) {
          //       const edge = graph.edges[collectionEdges[0]];
          //       return {...edge, properties: {collection: edge.end}}
          //     } else {
          //       return {properties: {}}
          //     }
          //   }
          // },
          attributes: [
            {
              id: "collection",
              component: "Select",
              collection: "Collection",
              displayExpr: "properties.id"
            }
          ],
        },
        {
          id: "2", title: "Attributes",
          component: 'Table', edge: "FormLayoutItemHasAttribute",defaultValue: "undefined",
          // data: (mainId) => {
          //   const AttributeEdges = getOutEdgeIdsOfType(mainId, "FormLayoutItemHasAttribute").map(edge =>
          //    graph.edges[edge]).sort((a, b) => a.properties.pos - b.properties.pos);
          //   return {properties: {FormLayoutItemHasAttribute: AttributeEdges.map(edge=>({
          //         ...edge, properties: {...edge.properties, attribute: edge.end}, _id: edge.id}))}}
          // },
          // save: (txnId, results, tableData)=>{
          //   const edge = "FormLayoutItemHasAttribute";
          //   const endIdAttribute = "attribute";
          //   return saveTableDataToEdge(txnId, tableData, results, edge, endIdAttribute);
          // },
          defaultValueFn: tableOverwriteDefaultValueFn(),
          attributes: [
            {
              id: "pos",
              serverType: "Integer",
              // default: (formValues, control) => (control as ReturnType<typeof createFormArray>).controls.length + 1,
              hidden: true
            },
            {
              id: "attribute",
              component: "Select",
              displayExpr: "properties.id",
              // default: (formValues, control, id: string) => id && graph.edges[id].end,
              collection: "(1:collection)->[CollectionHasAttribute]",
            },

            { id: "id", serverType: "String" },
            // { id: "selector", type: "String"},
            {
              id: "serverType",
              component: "Select",
              collection: "DataType",
              displayExpr: "properties.id",
              noInput: true,
              fieldOptions: { disabled: true },
            },
            {
              id: "component",
              component: "Select",
              displayExpr: "properties.id",
              collection: "(attribute:properties.serverType)->[DataTypeComponent]",
            },
            { id: "label", serverType: "String" },
            // { id: "internal", type: "Boolean" },
            { id: "unique", serverType: "Boolean" },
            { id: "required", serverType: "Boolean" },
            { id: "readonly", serverType: "Boolean" },
            { id: "disabled", serverType: "Boolean" },
            { id: "default", serverType: "Map" }, // TODO: make a function, that accept value and based on serverType display different component (and convert to value in new type).
            { id: "onChange", component: 'JsCode' },
            { id: "props", component: 'JsCode' },
            { id: "code", component: 'JsCode' },
            { id: "meta", component: 'JsCode' },
          ],
        }
        ],
      },


    "FormLayout": {
        id: "0", title: "FormLayout1", label: "FormLayout", attributes: [
          { id: "id", serverType: "String" },
          { id: "title", serverType: "String" },
          { id: "description", component: "TextArea" },
          { id: "meta", component: "JsCode" },
          // { id: "forms", component: "table_forms" },
          // { id: "buttongroup", component: "buttongroup", buttons: [{design: "Default", children: "OK", class: "mr-2"}, {design: "Negative", children: "Cancel"}] },
          {
            id: "FormLayoutHasItem",
            title: "Forms",
            component: 'TableForm', form: "FormLayoutItem",defaultValue: "undefined",
            edge: "FormLayoutHasItem",
            // data: (mainId) => {
            //   const AttributeEdges = getOutEdgeIdsOfType(mainId, "FormLayoutHasItem").map(edge => graph.edges[edge]).sort((a, b) => a.properties.pos - b.properties.pos);
            //   return {properties: {FormLayoutItem: AttributeEdges.map(edge=>({...edge, properties: {...edge.properties}, _id: edge.id}))}}
            // },
            noSort: true,
            // save: (txnId, results, tableData)=> {
            //   const edge = "FormLayoutHasItem";
            //   return saveFormLayoutTableDataToEdge(txnId, tableData, results, edge);
            // },
            // postSubmit: (formValues, formGroup, tableItemFormGroup, values)=>{
            //   tableItemFormGroup.controls["end"].setValue(values.get("0").id);
            // },
            attributes: [
              {
                id: "pos",
                serverType: "Integer",
                // default: (formValues, control) => (control as ReturnType<typeof createFormArray>).controls.length + 1,
                hidden: true
              }
            ]
          }
        ],
      },
         "TableLayout": [{
        id: "0",
        title: "FormLayout1",
        label: "TableLayout",
        attributes: [
          { id: "id", serverType: "String" }
        ]
      }]
  };

window.a = AttributesTableData