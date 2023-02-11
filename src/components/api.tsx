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
    "Component": {  title: "Component", label: "Component", attributes: [{ id: "id", serverType: "String" }] },
    "Attribute": {
         title: "Attribute", label: "Attribute", attributes: [
          { id: "id", serverType: "String" },
          {
            id: "serverType",
            component: "Select",
            displayExpr: "properties.id",
            collection: "DataType",
            onchange: '["component",null]',
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
        title: "Collection Category",
        label: "CollectionCategory",
        attributes: [
          { id: "id", serverType: "String" },
          { id: "description", component: "TextArea" }
        ]
      },

   // TODO: Collection has only one attribute. Add validation for that.
    "Collection":{
        title: "Collection",
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
          id: "Tab",
          component: "Table",

          attributes: [
           {
            id: "id",
            component: "TextInput"
           },
           {
            id: "label",
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
            id: "label",
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
              collection: "<-Tab",
              displayExpr: "properties.id",
              noOverWrite: true,
             },
             {
              id: "group",
              component: "Select",
              collection: "<-Group",
              displayExpr: "properties.id",
              noOverWrite: true,
             },
              { id: "id", serverType: "String" },
              {
                id: "serverType",
                component: "Select",
                collection: "DataType",
                displayExpr: "properties.id",
                noInput: true,
                disabled: true,
                defaultValue: "attribute->serverType->id"
              },
              {
                id: "component",
                component: "Select",
                displayExpr: "properties.id",
                collection: "(attribute:properties.serverType)->[DataTypeComponent]", defaultValue: "attribute->component->id"
              },
              { id: "label", serverType: "String", defaultValue: "attribute->label" },
              { id: "unique", serverType: "Boolean", defaultValue: "attribute->unique" },
              { id: "required", serverType: "Boolean", defaultValue: "attribute->required" },
              { id: "readonly", serverType: "Boolean", defaultValue: "attribute->readonly" },
              { id: "disabled", serverType: "Boolean", defaultValue: "attribute->disabled" },
              { id: "default", serverType: "Map", defaultValue: "attribute->default" }, // TODO: make a function, that accept value and based on serverType display different component (and convert to value in new type).
              { id: "onChange", component: 'JsCode', defaultValue: "attribute->onChange" },
              { id: "props", component: 'JsCode', defaultValue: "attribute->props" },
              { id: "code", component: 'JsCode', defaultValue: "attribute->code" },
              { id: "meta", component: 'JsCode', defaultValue: "attribute->meta" },
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
          { id: "id", serverType: "String" },
          { id: "title", serverType: "String" },
          { id: "description", component: "TextArea" },
          // { id: "meta", component: "JsCode" },
          // { id: "forms", component: "table_forms" },
          // { id: "buttongroup", component: "buttongroup", buttons: [{design: "Default", children: "OK", class: "mr-2"}, {design: "Negative", children: "Cancel"}] },
      { id: "labelName",
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
         displayExpr: "id",
         // default: (formValues, control, id: string) => id && graph.edges[id].end,
         collection: "<-labelName->attribute->id",
        },

        { id: "id", serverType: "String" },
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
        { id: "unique", serverType: "Boolean" },
        { id: "required", serverType: "Boolean" },
        { id: "readonly", serverType: "Boolean" },
        { id: "disabled", serverType: "Boolean" },
        // { id: "default", serverType: "Map" }, // TODO: make a function, that accept value and based on serverType display different component (and convert to value in new type).
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
          { id: "id", serverType: "String" }
        ]
      }
  };

window.a = AttributesTableData