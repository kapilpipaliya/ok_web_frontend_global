import { getNewGraphId, graph } from "../lib/graph";
import { batch } from "solid-js";
import { createFormArray, IFormGroup } from "solid-forms";
import {
  EdgeLabels,
  FormMetaData,
  FormResult,
  ServerFormAttributeType,
  VertexLabels,
 Id
} from "ok_web_components/src/components/input/Form";
import { klona } from "klona/json";
import { A, D } from "@mobily/ts-belt";
import { Icon } from "@iconify-icon/solid";
import { findVertexIdsByLabel } from "../lib/Vertex";
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
  return (control: IFormGroup, key: string) => {
    const value = graph.vertexes[control.controls.attribute.value]?.["properties"]?.[key];
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

export function fetchAttributesTableData(
  schema: string
): FormMetaData[] {
  switch (schema) {
    case "ServerAttributeType": {
      return [
        {
          id: "0",
          title: "ServerFormAttributeType",
          save: ["vertex", VertexLabels.ServerAttributeType],
          attributes: [
            { id: "id", serverType: ServerFormAttributeType.String },
            {
              id: "default",
              component: "Select",
              displayExpr: "properties.id",
              fetchOptions: async (formValues, formGroup, inputValue: string) => findVertexIdsByLabel("FormAttributeType").map((id) => graph.vertexes[id])
            }
          ]
        },
        {
          id: "ServerToFormAttributeType",
          component: "Table",
          edge: "ServerToFormAttributeType",
          defaultValue: "undefined",
          // save: ["edge", EdgeLabels.CollectionHasAttribute,(id)=>id, (results, formValue)=>formValue['attribute']],
          // save: ["edge", EdgeLabels.ServerToFormAttributeType],
          data: (mainId) => {
            const AttributeEdges = getOutEdgeIdsOfType(mainId, EdgeLabels.ServerToFormAttributeType).map(edge => graph.edges[edge]).sort((a, b) => a.properties.pos - b.properties.pos);
            return AttributeEdges.map(edge => ({
              ...edge,
              properties: { ...edge.properties, formAttributeType: edge.end },
              _id: edge.id
            }));
          },
          save: (txnId, results, tableData) => {
            const edge = EdgeLabels.ServerToFormAttributeType;
            const endIdAttribute = "formAttributeType";
            return saveTableDataToEdge(txnId, tableData, results, edge, endIdAttribute);
          },
          attributes: [
            {
              id: "pos",
              serverType: ServerFormAttributeType.Integer,
              default: (formValues, control) => (control as ReturnType<typeof createFormArray>).controls.length + 1,
              hidden: true
            },
            {
              id: "formAttributeType",
              component: "Select",
              displayExpr: "properties.id",
              fetchOptions: async (formValues, formGroup, inputValue: string) => findVertexIdsByLabel("FormAttributeType").map((id) => graph.vertexes[id])
            }
          ]
        }];
    }
    case "FormAttributeType": {
      return [{ id: "0", title: "FormAttributeType", save: ["vertex", VertexLabels.FormAttributeType], attributes: [{ id: "id", serverType: ServerFormAttributeType.String }] }];
    }
    case "Attribute": {
      return [{
        id: "0", title: "Attribute", save: ["vertex", VertexLabels.Attribute], attributes: [
          { id: "id", serverType: ServerFormAttributeType.String },
          // { id: "selector", type: ServerFormAttributeType.String },
          {
            id: "serverType",
            component: "Select",
            displayExpr: "properties.id",
            fetchOptions: async (formValues, formGroup, inputValue: string) => findVertexIdsByLabel("ServerAttributeType").map((id) => graph.vertexes[id]),
            onchange: (formGroup, value) => {
              formGroup.controls["component"].setValue(null);
            }
          },
          {
            id: "component",
            component: "Select",
            displayExpr: "properties.id",
            fetchOptions: async (formValues, formGroup, inputValue: string) => {
              const serverTypeValue = formGroup.controls["serverType"].value;
              if (!serverTypeValue) return [];
              return getOutEdgeIdsOfType(serverTypeValue, EdgeLabels.ServerToFormAttributeType).map(id => graph.vertexes[graph.edges[id].end]);
            }
          },
          { id: "label", serverType: ServerFormAttributeType.String },
          // { id: "internal", type: ServerFormAttributeType.Boolean },
          { id: "unique", serverType: ServerFormAttributeType.Boolean },
          { id: "required", serverType: ServerFormAttributeType.Boolean },
          { id: "readonly", serverType: ServerFormAttributeType.Boolean },
          { id: "disabled", serverType: ServerFormAttributeType.Boolean },
          // { id: "internal", type: ServerFormAttributeType.Boolean },
          { id: "default", serverType: ServerFormAttributeType.Map }, // TODO: make a function, that accept value and based on serverType display different component (and convert to value in new type).
          { id: "onChange", component: "JsCode" },
          { id: "props", component: "JsCode" },
          {
            id: "code",
            component: "JsCode",
            props: { placeholder: "write attributes for non base field" }
          },
          { id: "meta", component: "JsCode" }
        ],
      }];
    }
    case "CollectionCategory": {
      return [{
        id: "0",
        title: "Collection Category",
        save: ["vertex", VertexLabels.CollectionCategory],
        attributes: [
          { id: "id", serverType: ServerFormAttributeType.String },
          { id: "description", component: "TextArea" }
        ]
      }];
    }
   // TODO: Collection has only one attribute. Add validation for that.
    case "Collection": {
      return [{
        id: "0",
        title: "Collection1",
        save: ["vertex", VertexLabels.Collection],
        attributes: [
          { id: "id", serverType: ServerFormAttributeType.String },
          {
            id: "category",
            component: "Select",
            displayExpr: "properties.id",
            fetchOptions: async () => (graph.vertexLabelIdMap["CollectionCategory"] || []).map(id => graph.vertexes[id])
          },
          { id: "description", component: "TextArea" }
        ]
      },
        {
          id: "1", title: "Collection2",
          // save: ["edge", Edges.CollectionHasAttribute,(id)=>id, (results, formValue)=>formValue['attribute']],
          save: ["edge", EdgeLabels.CollectionHasAttribute],
          data: (mainId) => {
            const AttributeEdges = getOutEdgeIdsOfType(mainId, EdgeLabels.CollectionHasAttribute).map(edge => graph.edges[edge]).sort((a, b) => a.properties.pos - b.properties.pos);
            return {properties: {CollectionHasAttribute: AttributeEdges.map(edge=>({...edge, properties: {...edge.properties, attribute: edge.end}, _id: edge.id}))}}
          },
          attributes: [
            { id: "CollectionHasAttribute", component: 'Table', edge: "CollectionHasAttribute",defaultValue: "undefined",
              save: (txnId, results, tableData)=>{
                const edge = EdgeLabels.CollectionHasAttribute;
                const endIdAttribute = "attribute";
                return saveTableDataToEdge(txnId, tableData, results, edge, endIdAttribute);
              },
              defaultValueFn: tableOverwriteDefaultValueFn(),
              attributes: [
                {
                  id: "pos",
                  serverType: ServerFormAttributeType.Integer,
                  default: (formValues, control) => (control as ReturnType<typeof createFormArray>).controls.length + 1,
                  hidden: true
                },
                {
                  id: "attribute",
                  component: "Select",
                  displayExpr: "properties.id",
                  noOverWrite: true,
                  default: (formValues, control, id: string) => id && graph.edges[id].end,
                  fetchOptions: async (formValues, formGroup, inputValue) => findVertexIdsByLabel("Attribute").map((id) => graph.vertexes[id])
                },

                { id: "id", serverType: ServerFormAttributeType.String },
                // { id: "selector", type: ServerFormAttributeType.String},
                {
                  id: "serverType",
                  component: "Select",
                  displayExpr: "properties.id",
                  noInput: true,
                  fieldOptions: { disabled: true },
                  fetchOptions: async (formValues, formGroup, inputValue) => findVertexIdsByLabel("ServerAttributeType").map((id) => graph.vertexes[id])
                },
                {
                  id: "component",
                  component: "Select",
                  displayExpr: "properties.id",
                  fetchOptions: async (formValues, formGroup, inputValue) => {
                    const serverTypeValue = graph.vertexes[formGroup.controls.attribute.value]?.["properties"]["serverType"];
                    if (serverTypeValue) {
                      return (graph.vertexes[serverTypeValue].out_edges["ServerToFormAttributeType"] || []).map(edgeId => graph.edges[edgeId].end).map(id => graph.vertexes[id]);
                    } else {
                      return [];
                    }
                  }
                },
                { id: "label", serverType: ServerFormAttributeType.String },
                // { id: "internal", type: ServerFormAttributeType.Boolean },
              { id: "unique", serverType: ServerFormAttributeType.Boolean },
              { id: "required", serverType: ServerFormAttributeType.Boolean },
              { id: "readonly", serverType: ServerFormAttributeType.Boolean },
              { id: "disabled", serverType: ServerFormAttributeType.Boolean },
              { id: "default", serverType: ServerFormAttributeType.Map }, // TODO: make a function, that accept value and based on serverType display different component (and convert to value in new type).
              { id: "onChange", component: 'JsCode' },
              { id: "props", component: 'JsCode' },
              { id: "code", component: 'JsCode' },
              { id: "meta", component: 'JsCode' },
              ], },
          ],
        }, {
          id: "2",
          component: "Table",
          edge: "CollectionHasChild",
          defaultValue: "undefined",
          // save: ["edge", EdgeLabels.CollectionHasAttribute,(id)=>id, (results, formValue)=>formValue['attribute']],
          // save: ["edge", EdgeLabels.ServerToFormAttributeType],
          data: (mainId) => {
            const AttributeEdges = getOutEdgeIdsOfType(mainId, EdgeLabels.CollectionHasChild).map(edge => graph.edges[edge]).sort((a, b) => a.properties.pos - b.properties.pos);
            return AttributeEdges.map(edge => ({
              ...edge,
              properties: { ...edge.properties, collection: edge.end },
              _id: edge.id
            }));
          },
          save: (txnId, results, tableData) => {
            const edge = EdgeLabels.CollectionHasChild;
            const endIdAttribute = "collection";
            return saveTableDataToEdge(txnId, tableData, results, edge, endIdAttribute);
          },
          attributes: [
            {
              id: "pos",
              serverType: ServerFormAttributeType.Integer,
              default: (formValues, control) => (control as ReturnType<typeof createFormArray>).controls.length + 1,
              hidden: true
            },
            {
              id: "collection",
              component: "Select",
              displayExpr: "properties.id",
              fetchOptions: async (formValues, formGroup, inputValue: string) => findVertexIdsByLabel("Collection").map((id) => graph.vertexes[id])
            },
            {
              id: "type",
              component: "TextInput"
            }
          ]
        }];
    }
    case "FormLayoutItem": {
      return [{
        id: "0", title: "FormLayoutItem1", save: ["vertex", VertexLabels.FormLayoutItem], attributes: [
          { id: "id", serverType: ServerFormAttributeType.String },
          // TODO: make title required
          { id: "title", serverType: ServerFormAttributeType.String },
          { id: "description", component: "TextArea" },
          { id: "component", serverType: ServerFormAttributeType.String },
          {
            id: "labelType",
            component: "Select",
            displayExpr: "id",
            fetchOptions: async () => [{ id: "vertex" }, { id: "edge" }]
          },
          { id: "labelName", component: "Select", fetchOptions: async () => graph.vertexLabelIdMap["Collection"].map(id => graph.vertexes[id]), displayExpr: "properties.id", },
          {
            id: "from",
            component: "JsCode",
            label: "From Function",
            props: { placeholder: "(results: FormResult, formValue: object)=> Id" }
          },
          {
            id: "to",
            component: "JsCode",
            label: "To Function",
            props: { placeholder: "(results: FormResult, formValue: object)=> Id" }
          },
          { id: "meta", component: "JsCode", props: { placeholder: "({})" } }
          // { id: "buttongroup", component: "buttongroup", buttons: [{design: "Default", children: "OK", class: "mr-2"}, {design: "Negative", children: "Cancel"}] },
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
            {
              id: "collection",
              component: "Select",
              displayExpr: "properties.id",
              fetchOptions: async (formValues, formGroup, inputValue) => findVertexIdsByLabel("Collection").map((id) => graph.vertexes[id])
            }
          ],
        },
        {
          id: "2", title: "Attributes",
          save: ["edge", EdgeLabels.FormLayoutItemHasAttribute],
          data: (mainId) => {
            const AttributeEdges = getOutEdgeIdsOfType(mainId, EdgeLabels.FormLayoutItemHasAttribute).map(edge => graph.edges[edge]).sort((a, b) => a.properties.pos - b.properties.pos);
            return {properties: {FormLayoutItemHasAttribute: AttributeEdges.map(edge=>({...edge, properties: {...edge.properties, attribute: edge.end}, _id: edge.id}))}}
          },
          attributes: [
            { id: "FormLayoutItemHasAttribute", component: 'Table', edge: "FormLayoutItemHasAttribute",defaultValue: "undefined",
              save: (txnId, results, tableData)=>{
                const edge = EdgeLabels.FormLayoutItemHasAttribute;
                const endIdAttribute = "attribute";
                return saveTableDataToEdge(txnId, tableData, results, edge, endIdAttribute);
              },
              defaultValueFn: tableOverwriteDefaultValueFn(),
              attributes: [
                {
                  id: "pos",
                  serverType: ServerFormAttributeType.Integer,
                  default: (formValues, control) => (control as ReturnType<typeof createFormArray>).controls.length + 1,
                  hidden: true
                },
                {
                  id: "attribute",
                  component: "Select",
                  displayExpr: "properties.id",
                  default: (formValues, control, id: string) => id && graph.edges[id].end,
                  fetchOptions: async (formValues, formGroup, inputValue) => {
                    const collectionId = (formValues.controls["1"] as IFormGroup).controls.collection.value;
                    if (collectionId) {
                      const collectionVertex = graph.vertexes[collectionId];
                      if (collectionVertex) {
                        return (collectionVertex.out_edges[EdgeLabels.CollectionHasAttribute] || []).map(id => graph.vertexes[graph.edges[id].end]);
                      }
                    }
                    return [];
                    // findVertexIdsByLabel("Attribute").map((id) => graph.vertexes[id])
                  }
                },

                { id: "id", serverType: ServerFormAttributeType.String },
                // { id: "selector", type: ServerFormAttributeType.String},
                {
                  id: "serverType",
                  component: "Select",
                  displayExpr: "properties.id",
                  noInput: true,
                  fieldOptions: { disabled: true },
                  fetchOptions: async (formValues, formGroup, inputValue) => findVertexIdsByLabel("ServerAttributeType").map((id) => graph.vertexes[id])
                },
                {
                  id: "component",
                  component: "Select",
                  displayExpr: "properties.id",
                  fetchOptions: async (formValues, formGroup, inputValue) => {
                    const serverTypeValue = graph.vertexes[formGroup.controls.attribute.value]?.["properties"]["serverType"];
                    if (serverTypeValue) {
                      return (graph.vertexes[serverTypeValue].out_edges["ServerToFormAttributeType"] || []).map(edgeId => graph.edges[edgeId].end).map(id => graph.vertexes[id]);
                    } else {
                      return [];
                    }
                  }
                },
                { id: "label", serverType: ServerFormAttributeType.String },
                // { id: "internal", type: ServerFormAttributeType.Boolean },
                { id: "unique", serverType: ServerFormAttributeType.Boolean },
              { id: "required", serverType: ServerFormAttributeType.Boolean },
              { id: "readonly", serverType: ServerFormAttributeType.Boolean },
              { id: "disabled", serverType: ServerFormAttributeType.Boolean },
              { id: "default", serverType: ServerFormAttributeType.Map }, // TODO: make a function, that accept value and based on serverType display different component (and convert to value in new type).
              { id: "onChange", component: 'JsCode' },
              { id: "props", component: 'JsCode' },
              { id: "code", component: 'JsCode' },
              { id: "meta", component: 'JsCode' },
            ],},
          ],
        }];
    }
    case "FormLayout": {
      return [{
        id: "0", title: "FormLayout1", save: ["vertex", VertexLabels.FormLayout], attributes: [
          { id: "id", serverType: ServerFormAttributeType.String },
          { id: "title", serverType: ServerFormAttributeType.String },
          { id: "description", component: "TextArea" },
          { id: "meta", component: "JsCode" }
          // { id: "forms", component: "table_forms" },
          // { id: "buttongroup", component: "buttongroup", buttons: [{design: "Default", children: "OK", class: "mr-2"}, {design: "Negative", children: "Cancel"}] },
        ],
      },
        {
          id: "1", title: "Forms",
          save: ["edge", EdgeLabels.FormLayoutHasItem],
          data: (mainId) => {
            const AttributeEdges = getOutEdgeIdsOfType(mainId, EdgeLabels.FormLayoutHasItem).map(edge => graph.edges[edge]).sort((a, b) => a.properties.pos - b.properties.pos);
            return {properties: {FormLayoutItem: AttributeEdges.map(edge=>({...edge, properties: {...edge.properties}, _id: edge.id}))}}
            // return {properties: {FormLayoutItem: AttributeEdges}}
          },
          attributes: [
            { id: "FormLayoutItem", component: 'TableForm', form: "FormLayoutItem",defaultValue: "undefined",
              noSort: true,
              save: (txnId, results, tableData)=> {
                const edge = EdgeLabels.FormLayoutHasItem;
                return saveFormLayoutTableDataToEdge(txnId, tableData, results, edge);
              },
              postSubmit: (formValues, formGroup, tableItemFormGroup, values)=>{
                // tableItemFormGroup =  FormLayoutHasItem
                // values = all the form values
                tableItemFormGroup.controls["end"].setValue(values.get("0").id);
              },
              attributes: [
                {
                  id: "pos",
                  serverType: ServerFormAttributeType.Integer,
                  default: (formValues, control) => (control as ReturnType<typeof createFormArray>).controls.length + 1,
                  hidden: true
                }
              ]
            },
          ],
        }];
    }
    case "TableLayout": {
      return [{
        id: "0",
        title: "FormLayout1",
        save: ["vertex", "TableLayout"],
        attributes: [
          { id: "id", serverType: ServerFormAttributeType.String }
        ]
      }];
    }
  }
}