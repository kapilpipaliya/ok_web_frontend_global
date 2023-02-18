import { FormMetaData } from "./input/Form";

/* use in c++
export const JSONToCypherMap = (json: object) => {
  // https://stackoverflow.com/questions/20841571/how-to-solve-the-dilemma-while-handle-json-in-neo4j-cypher
  return jju.stringify(json, { quote: "'" }).replace(/"/g, "\\x22");
};
*/

export const AttributesTableData: {[key: string]: FormMetaData} = {
   "DataType":
       {
         title: "DataType",
         label: "DataType",
         attributes: [
           { id: "id", dataType: "String" },
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
    "Component": {  title: "Component", label: "Component", attributes: [{ id: "id", dataType: "String" }] },
    "Attribute": {
         title: "Attribute", label: "Attribute", attributes: [
          { id: "id", dataType: "String" },
          {
            id: "dataType",
            component: "Select",
            displayExpr: "properties.id",
            collection: "DataType",
            onchange: '["component",null]',
          },
          {
            id: "component",
            component: "Select",
            collection: "AttributeDataType->DataTypeComponent",
            displayExpr: "properties.id",
          },
          { id: "title", dataType: "String" },
          { id: "unique", dataType: "Boolean" },
          { id: "required", dataType: "Boolean" },
          { id: "readonly", dataType: "Boolean" },
          { id: "disabled", dataType: "Boolean" },
        ],
      },
    "CollectionCategory": {
        title: "Collection Category",
        label: "CollectionCategory",
        attributes: [
          { id: "id", dataType: "String" },
          { id: "description", component: "TextArea" }
        ]
      },

   // TODO: Collection has only one attribute. Add validation for that.
    "Collection":{
        title: "Collection",
        label: "Collection",
        attributes: [
          { id: "id", dataType: "String" },
          {
            id: "category",
            component: "Select",
            collection: "CollectionCategory",
            displayExpr: "properties.id",
          },
          { id: "description", component: "TextArea" },
         {
          id: "Tab",
          component: "Table",

          attributes: [
           {
            id: "id",
            component: "TextInput"
           },
           {
            id: "name",
            component: "TextInput"
           }
          ]
         },
         {
          id: "Group",
          component: "Table",

          attributes: [
           {
            id: "id",
            component: "TextInput"
           },
           {
            id: "name",
            component: "TextInput"
           }
          ]
         },
          {
            id: "Attribute",
            label: "Attributes",
            component: "Table",
            attributes: [
              {
                id: "attribute",
                component: "Select",
                collection: "Attribute",
                displayExpr: "properties.id",
                noOverWrite: true,
              },
             {
              id: "tab",
              component: "Select",
              collection: "CollectionAttribute<-CollectionTab",
              displayExpr: "properties.id",
              noOverWrite: true,
             },
             {
              id: "group",
              component: "Select",
              collection: "CollectionAttribute<-CollectionGroup",
              displayExpr: "properties.id",
              noOverWrite: true,
             },
              {
                id: "dataType",
                component: "Select",
                collection: "DataType",
                displayExpr: "properties.id",
                noInput: true,
                disabled: true,
                defaultValue: "->CollectionAttributeAttribute->AttributeDataType:properties.id"
              },
              {
                id: "component",
                component: "Select",
                displayExpr: "properties.id",
               noOverWrite: true,
                collection: "CollectionAttributeAttribute->AttributeDataType->DataTypeComponent", defaultValue: "->CollectionAttributeAttribute->AttributeComponent:properties.id"
              },
              { id: "title", dataType: "String", defaultValue: "->CollectionAttributeAttribute:properties.title" },
              { id: "unique", dataType: "Boolean", defaultValue: "->CollectionAttributeAttribute:properties.unique" },
              { id: "required", dataType: "Boolean", defaultValue: "->CollectionAttributeAttribute:properties.required" },
              { id: "readonly", dataType: "Boolean", defaultValue: "->CollectionAttributeAttribute:properties.readonly" },
              { id: "disabled", dataType: "Boolean", defaultValue: "->CollectionAttributeAttribute:properties.disabled" },
            ],

          },
          {
            id: "Child",
            component: "Table",

            attributes: [
              {
                id: "collection",
                component: "Select",
                collection: "Collection",
                displayExpr: "properties.id",
               noOverWrite: true,
              },
              {
                id: "type",
                component: "TextInput"
              }
            ]
          }
        ]
      },

    "FormLayout": {
         title: "FormLayout1", label: "FormLayout", attributes: [
          { id: "id", dataType: "String" },
          { id: "title", dataType: "String" },
          { id: "description", component: "TextArea" },
          // { id: "meta", component: "JsCode" },
          // { id: "forms", component: "table_forms" },
          // { id: "buttongroup", component: "buttongroup", buttons: [{design: "Default", children: "OK", class: "mr-2"}, {design: "Negative", children: "Cancel"}] },
      { id: "collection",
       component: "Select",
       collection: "Collection",
       displayExpr: "properties.id", },
      // { id: "buttongroup", component: "buttongroup", buttons: [{design: "Default", children: "OK", class: "mr-2"}, {design: "Negative", children: "Cancel"}] },

      {
       id: "Attribute",
       label: "Attributes",
       component: 'Table',
       attributes: [
        {
         id: "attribute",
         component: "Select",
         // TODO: fix this make a function to return nested projection id:
         displayExpr: "properties.id",
         collection: "FormLayoutAttribute<-FormLayoutCollection->CollectionAttribute",
        },
        {
         id: "dataType",
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
         collection: "(attribute:properties.dataType)->[DataTypeComponent]",
        },
        { id: "title", dataType: "String" },
        { id: "unique", dataType: "Boolean" },
        { id: "required", dataType: "Boolean" },
        { id: "readonly", dataType: "Boolean" },
        { id: "disabled", dataType: "Boolean" },
        // { id: "default", dataType: "Map" }, // TODO: make a function, that accept value and based on dataType display different component (and convert to value in new type).
        // { id: "onChange", component: 'JsCode' },
        // { id: "props", component: 'JsCode' },
        // { id: "code", component: 'JsCode' },
        // { id: "meta", component: 'JsCode' },
       ],
      }
        ],
      },
         "TableLayout": {

        title: "FormLayout1",
        label: "TableLayout",
        attributes: [
          { id: "id", dataType: "String" }
        ]
      }
  };

window.a = AttributesTableData