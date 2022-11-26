import jju from "jju";
import { getNewGraphId, graph,  } from "../lib/graph";
import { batch } from "solid-js";
import { createFormArray, IFormGroup } from "solid-forms";
import { FormMetaData, FormResult, ServerFormAttributeType, VertexLabels, EdgeLabels, Id } from 'ok_web_components/src/components/input/Form';
import { klona } from "klona/json";
import { A, D } from "@mobily/ts-belt";
import { Icon } from '@iconify-icon/solid';
import { findVertexIdsByLabel } from "../lib/Vertex";
import {
  addNewEdge,
  deleteEdge,
  getOutEdgeIdsOfType, newEdge, replaceEdgeProperties,
  updateEdgeStartAndEnd
} from "../lib/Edge";

/* use in c++
export const JSONToCypherMap = (json: object) => {
  // https://stackoverflow.com/questions/20841571/how-to-solve-the-dilemma-while-handle-json-in-neo4j-cypher
  return jju.stringify(json, { quote: "'" }).replace(/"/g, "\\x22");
};
*/
function saveTableDataToEdge(tableData: any[], results: FormResult, edge: string, endIdAttribute: string) {
  const normalizedEdgesValue = tableData.reduce((acc, curr) => {
    acc[curr.id] = D.deleteKeys(klona(curr), ["id", '_id']);
    return acc;
  }, {});

  const newIds = Object.keys(normalizedEdgesValue) as Array<string>;
  const existingAttributeEdgeIds = getOutEdgeIdsOfType(results.get("0").id, edge).map(x => `${x}`) as Array<string>;

  const insertedAttributeIds = A.difference(newIds, existingAttributeEdgeIds);
  let deletedAttributeIds = A.difference(existingAttributeEdgeIds, newIds);
  let updatedAttributeIds = A.intersection(newIds, existingAttributeEdgeIds);

  const endIdExist = (id) => !!normalizedEdgesValue[id]['properties'][endIdAttribute];
  const deleteInvalidUpdate = updatedAttributeIds.filter(id => !endIdExist(id));
  deletedAttributeIds = A.concat(deletedAttributeIds, deleteInvalidUpdate);
  updatedAttributeIds = A.difference(updatedAttributeIds, deleteInvalidUpdate);

  const insertAndUpdatedIds = A.difference(newIds, deletedAttributeIds);
  const result = {};

  batch(() => {
    deletedAttributeIds.forEach(id => deleteEdge(id));
    insertedAttributeIds.forEach(id => {
      if (!endIdExist(id)) {
        result[id] = id;
        return;
      }
      const newId = getNewGraphId();
      addNewEdge(newEdge(newId, edge, D.deleteKeys(normalizedEdgesValue[id]['properties'], [endIdAttribute]), results.get("0").id, normalizedEdgesValue[id]['properties'][endIdAttribute]));
      result[id] = newId;
    });
    updatedAttributeIds.forEach(id => {
      replaceEdgeProperties(id, D.deleteKeys(normalizedEdgesValue[id]['properties'], [endIdAttribute]));
      updateEdgeStartAndEnd(id, results.get("0").id, normalizedEdgesValue[id]['properties'][endIdAttribute]);
      result[id] = id;
    });
  });

  return insertAndUpdatedIds.map(id=>result[id]);
}
function saveFormLayoutTableDataToEdge(tableData: any[], results: FormResult, edge: string) {
  const normalizedEdgesValue = tableData.reduce((acc, curr) => {
    acc[curr.end] = klona(curr);
    return acc;
  }, {});

  const newIds = Object.keys(normalizedEdgesValue) as Array<string>;
  const existingAttributeEdgeIds = getOutEdgeIdsOfType(results.get("0").id, edge).map(x => `${x}`) as Array<string>;

  const insertedAttributeIds = A.difference(newIds, existingAttributeEdgeIds);
  let deletedAttributeIds = A.difference(existingAttributeEdgeIds, newIds);
  let updatedAttributeIds = A.intersection(newIds, existingAttributeEdgeIds);

  const endIdExist = (id) => !!normalizedEdgesValue[id]['end'];
  const deleteInvalidUpdate = updatedAttributeIds.filter(id => !endIdExist(id));
  deletedAttributeIds = A.concat(deletedAttributeIds, deleteInvalidUpdate);
  updatedAttributeIds = A.difference(updatedAttributeIds, deleteInvalidUpdate);

  const insertAndUpdatedIds = A.difference(newIds, deletedAttributeIds);
  const result = {};

  batch(() => {
    deletedAttributeIds.forEach(id => deleteEdge(id));

    insertedAttributeIds.forEach(id => {
      if (!endIdExist(id)) {
        result[id] = id;
        return;
      }
      const newId = getNewGraphId();
      addNewEdge(newEdge(newId, edge, normalizedEdgesValue[id]['properties'], results.get("0").id, id));
      result[id] = newId;
    });
    updatedAttributeIds.forEach(id => {
      replaceEdgeProperties(id, normalizedEdgesValue[id]['properties']);
      updateEdgeStartAndEnd(id, results.get("0").id, id);
      result[id] = id;
    });
  });

  return insertAndUpdatedIds.map(id=>result[id]);
}

function tableOverwriteDefaultValueFn() {
  return (control: IFormGroup, key: string) => {
    const value = graph.vertexes[control.controls.attribute.value]?.["properties"]?.[key];
    if (typeof value === "boolean") {
      return value === true ? "true" : "false";
    } else if (key === "serverType") {
      return value ? graph.vertexes[value]["properties"]["id"] : "";
    } else if (key === "formType") {
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

export function fetchAttributesTableData(
  schema: string
): FormMetaData[] {
  switch (schema) {
    case "ServerAttributeType": {
      return [
       { id: "0", title: "ServerFormAttributeType", save: ["vertex", VertexLabels.ServerAttributeType],
         attributes: [
           { id: "id", type: ServerFormAttributeType.String },
           { id: "default", type: ServerFormAttributeType.Select, valueKey: "properties.id", fetchOptions:  async (formValues, formGroup, inputValue: string)=>findVertexIdsByLabel("FormAttributeType").map((id) => graph.vertexes[id]), },
         ] },
        {
          id: "1", title: "FormAttributeType",
          // save: ["edge", EdgeLabels.CollectionHasAttribute,(id)=>id, (results, formValue)=>formValue['attribute']],
          save: ["edge", EdgeLabels.ServerToFormAttributeType],
          data: (id) => {
            const AttributeEdges = getOutEdgeIdsOfType(id, EdgeLabels.ServerToFormAttributeType).map(edge => graph.edges[edge]); // todo sort by pos
            return {properties: {ServerToFormAttributeType: AttributeEdges.map(edge=>({...edge, properties: {...edge.properties, formAttributeType: edge.end}, _id: edge.id}))}}
          },
          attributes: [
            { id: "ServerToFormAttributeType", type: ServerFormAttributeType.Table, edge: "ServerToFormAttributeType",defaultValue: "undefined",
              save: (results, tableData)=>{
               const edge = EdgeLabels.ServerToFormAttributeType;
                const endIdAttribute = "formAttributeType";
                return saveTableDataToEdge(tableData, results, edge, endIdAttribute);
              },
              attributes: [
                { id: "pos", type: ServerFormAttributeType.Integer, default: (formValues, control)=>(control as ReturnType<typeof createFormArray>).controls.length + 1, hidden: true },
                { id: "formAttributeType", type: ServerFormAttributeType.Select, valueKey: "properties.id", fetchOptions:  async (formValues, formGroup, inputValue: string)=>findVertexIdsByLabel("FormAttributeType").map((id) => graph.vertexes[id]) },
              ], },
          ],
        }
      ];
    }
    case "FormAttributeType": {
      return [{ id: "0", title: "FormAttributeType", save: ["vertex", VertexLabels.FormAttributeType], attributes: [{ id: "id", type: ServerFormAttributeType.String }] }];
    }
    case "Attribute": {
      return [{
        id: "0", title: "Attribute", save: ["vertex", VertexLabels.Attribute], attributes: [
          { id: "id", type: ServerFormAttributeType.String },
          // { id: "selector", type: ServerFormAttributeType.String },
          { id: "serverType", type: ServerFormAttributeType.Select, valueKey: "properties.id", fetchOptions:  async (formValues, formGroup, inputValue: string)=>findVertexIdsByLabel("ServerAttributeType").map((id) => graph.vertexes[id]),
            onchange: (formGroup, value) => {
              formGroup.controls['formType'].setValue(null);
            } },
          { id: "formType", type: ServerFormAttributeType.Select, valueKey: "properties.id", fetchOptions:  async (formValues, formGroup, inputValue: string)=>{
            const serverTypeValue = formGroup.controls['serverType'].value;
            if(!serverTypeValue) return [];
            return getOutEdgeIdsOfType(serverTypeValue,  EdgeLabels.ServerToFormAttributeType).map(id=> graph.vertexes[graph.edges[id].end])
            } },
          { id: "label", type: ServerFormAttributeType.String },
          // { id: "internal", type: ServerFormAttributeType.Boolean },
          { id: "unique", type: ServerFormAttributeType.Boolean },
          { id: "required", type: ServerFormAttributeType.Boolean },
          { id: "readonly", type: ServerFormAttributeType.Boolean },
          { id: "disabled", type: ServerFormAttributeType.Boolean },
          // { id: "internal", type: ServerFormAttributeType.Boolean },
          { id: "default", type: ServerFormAttributeType.Object }, // TODO: make a function, that accept value and based on serverType display different component (and convert to value in new type).
          { id: "onChange", type: ServerFormAttributeType.JsCode },
          { id: "props", type: ServerFormAttributeType.JsCode },
          { id: "code", type: ServerFormAttributeType.JsCode, props: {placeholder: "write attributes for non base field"} },
        ],
      }];
    }
    // TODO: Collection has only one attribute. Add validation for that.
    case "Collection": {
      return [{
        id: "0", title: "Collection1", save: ["vertex", VertexLabels.Collection], attributes: [
          { id: "id", type: ServerFormAttributeType.String }, 
        ],
      },
        {
          id: "1", title: "Collection2",
          // save: ["edge", Edges.CollectionHasAttribute,(id)=>id, (results, formValue)=>formValue['attribute']],
          save: ["edge", EdgeLabels.CollectionHasAttribute],
          data: (id) => {
            const AttributeEdges = getOutEdgeIdsOfType(id, EdgeLabels.CollectionHasAttribute).map(edge => graph.edges[edge]); // todo sort by pos
            return {properties: {CollectionHasAttribute: AttributeEdges.map(edge=>({...edge, properties: {...edge.properties, attribute: edge.end}, _id: edge.id}))}}
          },
          attributes: [
            { id: "CollectionHasAttribute", type: ServerFormAttributeType.Table, edge: "CollectionHasAttribute",defaultValue: "undefined",
              save: (results, tableData)=>{
                const edge = EdgeLabels.CollectionHasAttribute;
                const endIdAttribute = "attribute";
                return saveTableDataToEdge(tableData, results, edge, endIdAttribute);
              },
              defaultValueFn: tableOverwriteDefaultValueFn(),
              attributes: [
              { id: "pos", type: ServerFormAttributeType.Integer, default: (formValues, control)=>(control as ReturnType<typeof createFormArray>).controls.length + 1, hidden: true },
              { id: "attribute", type: ServerFormAttributeType.Select, valueKey: "properties.id",noOverWrite: true, default: (formValues, control, id: string)=>id && graph.edges[id].end, fetchOptions:  async (formValues, formGroup, inputValue)=>findVertexIdsByLabel("Attribute").map((id) => graph.vertexes[id]) },

              { id: "id", type: ServerFormAttributeType.String },
              // { id: "selector", type: ServerFormAttributeType.String},
              { id: "serverType", type: ServerFormAttributeType.Select, valueKey: "properties.id", noInput: true, fieldOptions: {disabled: true}, fetchOptions:  async (formValues, formGroup, inputValue)=>findVertexIdsByLabel("ServerAttributeType").map((id) => graph.vertexes[id]) },
              { id: "formType", type: ServerFormAttributeType.Select, valueKey: "properties.id", fetchOptions:  async (formValues, formGroup, inputValue)=>{
                const serverTypeValue = graph.vertexes[formGroup.controls.attribute.value]?.["properties"]['serverType'];
                if(serverTypeValue) {
                  return (graph.vertexes[serverTypeValue].out_edges['ServerToFormAttributeType'] || []).map(edgeId => graph.edges[edgeId].end).map(id=>graph.vertexes[id]);
                } else {
                  return [];
                }
               }
              },
              { id: "label", type: ServerFormAttributeType.String },
              // { id: "internal", type: ServerFormAttributeType.Boolean },
              { id: "unique", type: ServerFormAttributeType.Boolean },
              { id: "required", type: ServerFormAttributeType.Boolean },
              { id: "readonly", type: ServerFormAttributeType.Boolean },
              { id: "disabled", type: ServerFormAttributeType.Boolean },
              { id: "default", type: ServerFormAttributeType.Object }, // TODO: make a function, that accept value and based on serverType display different component (and convert to value in new type).
              { id: "onChange", type: ServerFormAttributeType.JsCode },
              { id: "props", type: ServerFormAttributeType.JsCode },
              { id: "code", type: ServerFormAttributeType.JsCode },
            ], },
          ],
        }];
    }
    case "FormLayoutItem": {
      return [{
        id: "0", title: "FormLayoutItem1", save: ["vertex", VertexLabels.FormLayoutItem], attributes: [
          { id: "id", type: ServerFormAttributeType.String }, 
          // TODO: make title required
          { id: "title", type: ServerFormAttributeType.String },
          { id: "description", type: ServerFormAttributeType.String },
          { id: "labelType", type: ServerFormAttributeType.Select, valueKey: "id", fetchOptions:  async () => [{id: 'vertex'}, {id: 'edge' }] },
          { id: "labelName", type: ServerFormAttributeType.String },
          { id: "from", type: ServerFormAttributeType.JsCode, label: "From Function", props: {placeholder: "(results: FormResult, formValue: object)=> Id"} },
          { id: "to", type: ServerFormAttributeType.JsCode, label: "To Function", props: {placeholder: "(results: FormResult, formValue: object)=> Id"} },
          // { id: "buttongroup", type: "buttongroup", buttons: [{design: "Default", children: "OK", class: "mr-2"}, {design: "Negative", children: "Cancel"}] },
        ],
      },
        {
          id: "1", title: "", save: ["edge", EdgeLabels.FormLayoutItemHasCollection, (results)=>results.get('0')?.id, (results, formValue)=>formValue['collection']],
          data: (id)=>{
            if(id){
              const formVertex = graph.vertexes[id];
              const collectionEdges = formVertex.out_edges[EdgeLabels.FormLayoutItemHasCollection]
              if(collectionEdges && collectionEdges[0]) {
                const edge = graph.edges[collectionEdges[0]];
                return {...edge, properties: {collection: edge.end}}
              } else {
                return {properties: {}}
              }
            }
          },
          attributes: [
            { id: "collection", type: ServerFormAttributeType.Select, valueKey: "properties.id", fetchOptions:  async (formValues, formGroup, inputValue)=>findVertexIdsByLabel("Collection").map((id) => graph.vertexes[id]) },
          ],
        },
        {
          id: "2", title: "Attributes",
          save: ["edge", EdgeLabels.FormLayoutItemHasAttribute],
          data: (id) => {
            const AttributeEdges = getOutEdgeIdsOfType(id, EdgeLabels.FormLayoutItemHasAttribute).map(edge => graph.edges[edge]); // todo sort by pos
            return {properties: {FormLayoutItemHasAttribute: AttributeEdges.map(edge=>({...edge, properties: {...edge.properties, attribute: edge.end}, _id: edge.id}))}}
          },
          attributes: [
            { id: "FormLayoutItemHasAttribute", type: ServerFormAttributeType.Table, edge: "FormLayoutItemHasAttribute",defaultValue: "undefined",
              save: (results, tableData)=>{
                const edge = EdgeLabels.FormLayoutItemHasAttribute;
                const endIdAttribute = "attribute";
                return saveTableDataToEdge(tableData, results, edge, endIdAttribute);
              },
              defaultValueFn: tableOverwriteDefaultValueFn(),
              attributes: [
              { id: "pos", type: ServerFormAttributeType.Integer, default: (formValues, control)=>(control as ReturnType<typeof createFormArray>).controls.length + 1, hidden: true },
              { id: "attribute", type: ServerFormAttributeType.Select, valueKey: "properties.id", default: (formValues, control, id: string)=>id && graph.edges[id].end, fetchOptions:  async (formValues, formGroup, inputValue)=>findVertexIdsByLabel("Attribute").map((id) => graph.vertexes[id]) },

              { id: "id", type: ServerFormAttributeType.String },
              // { id: "selector", type: ServerFormAttributeType.String},
              { id: "serverType", type: ServerFormAttributeType.Select, valueKey: "properties.id", noInput: true, fieldOptions: {disabled: true}, fetchOptions:  async (formValues, formGroup, inputValue)=>findVertexIdsByLabel("ServerAttributeType").map((id) => graph.vertexes[id]) },
              { id: "formType", type: ServerFormAttributeType.Select, valueKey: "properties.id", fetchOptions:  async (formValues, formGroup, inputValue)=>{
                  const serverTypeValue = graph.vertexes[formGroup.controls.attribute.value]?.["properties"]['serverType'];
                  if(serverTypeValue) {
                    return (graph.vertexes[serverTypeValue].out_edges['ServerToFormAttributeType'] || []).map(edgeId => graph.edges[edgeId].end).map(id=>graph.vertexes[id]);
                  } else {
                    return [];
                  }
                } },
              { id: "label", type: ServerFormAttributeType.String },
              // { id: "internal", type: ServerFormAttributeType.Boolean },
              { id: "unique", type: ServerFormAttributeType.Boolean },
              { id: "required", type: ServerFormAttributeType.Boolean },
              { id: "readonly", type: ServerFormAttributeType.Boolean },
              { id: "disabled", type: ServerFormAttributeType.Boolean },
              { id: "default", type: ServerFormAttributeType.Object }, // TODO: make a function, that accept value and based on serverType display different component (and convert to value in new type).
              { id: "onChange", type: ServerFormAttributeType.JsCode },
              { id: "props", type: ServerFormAttributeType.JsCode },
              { id: "code", type: ServerFormAttributeType.JsCode },
            ], },
          ],
        }];
    }
    case "FormLayout": {
      return [{
        id: "0", title: "FormLayout1", save: ["vertex", VertexLabels.FormLayout], attributes: [
          { id: "id", type: ServerFormAttributeType.String },
          { id: "title", type: ServerFormAttributeType.String },
          { id: "description", type: ServerFormAttributeType.String },
          // { id: "forms", type: "table_forms" },
          // { id: "buttongroup", type: "buttongroup", buttons: [{design: "Default", children: "OK", class: "mr-2"}, {design: "Negative", children: "Cancel"}] },
        ],
      },
        {
          id: "1", title: "Forms",
          save: ["edge", EdgeLabels.FormLayoutHasItem],
          data: (id) => {
            const AttributeEdges = getOutEdgeIdsOfType(id, EdgeLabels.FormLayoutHasItem).map(edge => graph.edges[edge]); // todo sort by pos
            return {properties: {FormLayoutItem: AttributeEdges.map(edge=>({...edge, properties: {...edge.properties}, _id: edge.id}))}}
            // return {properties: {FormLayoutItem: AttributeEdges}}
          },
          attributes: [
            { id: "FormLayoutItem", type: ServerFormAttributeType.TableForm, form: "FormLayoutItem",defaultValue: "undefined",
              noSort: true,
              save: (results, tableData)=> {
                const edge = EdgeLabels.FormLayoutHasItem;
                return saveFormLayoutTableDataToEdge(tableData, results, edge);
              },
              postSubmit: (formValues, formGroup, tableItemFormGroup, values)=>{
                // tableItemFormGroup =  FormLayoutHasItem
                // values = all the form values
                tableItemFormGroup.controls['end'].setValue(values.get("0").id)
              },
              attributes: [
                { id: "pos", type: ServerFormAttributeType.Integer, default: (formValues, control)=>(control as ReturnType<typeof createFormArray>).controls.length + 1, hidden: true },
              ], },
          ],
        }];
    }
  }
}