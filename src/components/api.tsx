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

          columns: [
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

          columns: [
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
            columns: [
              {
                id: "attribute",
                component: "Select",
                collection: "Attribute",
                displayExpr: "properties.id",
                
              },
             {
              id: "tab",
              component: "Select",
              collection: "CollectionAttribute<-CollectionTab",
              displayExpr: "properties.id",
              
             },
             {
              id: "group",
              component: "Select",
              collection: "CollectionAttribute<-CollectionGroup",
              displayExpr: "properties.id",
              
             },
              {
                id: "dataType",
                component: "Select",
                collection: "DataType",
                displayExpr: "properties.id",
                hidden: true,
                disabled: true,
                defaultValue: "->CollectionAttributeAttribute->AttributeDataType:properties.id"
              },
              {
                id: "component",
                component: "Select",
                displayExpr: "properties.id",

                collection: "CollectionAttributeAttribute->AttributeDataType->DataTypeComponent",
               defaultValue: "->CollectionAttributeAttribute->AttributeComponent:properties.id"
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

            columns: [
              {
                id: "collection",
                component: "Select",
                collection: "Collection",
                displayExpr: "properties.id",
               
              },
             {
              id: "tab",
              component: "Select",
              collection: "CollectionChild<-CollectionTab",
              displayExpr: "properties.id",

             },
             {
              id: "group",
              component: "Select",
              collection: "CollectionChild<-CollectionGroup",
              displayExpr: "properties.id",

             },
            ]
          }
        ]
      },

    "FormLayout": {
         title: "FormLayout1", label: "FormLayout", attributes: [
          { id: "id", dataType: "String" },
          { id: "title", dataType: "String" },
          { id: "description", component: "TextArea" },
      { id: "collection",
       component: "Select",
       collection: "Collection",
       displayExpr: "properties.id", },
      {
       id: "Attribute",
       label: "Attributes",
       component: 'Table',
       columns: [
        {
         id: "attribute",
         component: "Select",
         displayExpr: "->CollectionAttributeAttribute:properties.id",
         collection: "FormLayoutAttribute<-FormLayoutCollection->CollectionAttribute",
        },
        {
         id: "tab",
         component: "Select",
         collection: "FormLayoutAttribute<-FormLayoutCollection->CollectionTab",
         displayExpr: "properties.id",
         defaultValue: "FormLayoutAttributeAttribute->CollectionAttributeTab:properties.id"
        },
        {
         id: "group",
         component: "Select",
         collection: "FormLayoutAttribute<-FormLayoutCollection->CollectionGroup",
         displayExpr: "properties.id",
         defaultValue: "FormLayoutAttributeAttribute->CollectionAttributeGroup:properties.id"
        },
        {
         id: "dataType",
         component: "Select",
         collection: "DataType",
         displayExpr: "properties.id",
         hidden: true,
         defaultValue: "FormLayoutAttributeAttribute->CollectionAttributeAttribute->AttributeDataType:properties.id"
        },
        {
         id: "component",
         component: "Select",
         displayExpr: "properties.id",
         collection: "FormLayoutAttributeAttribute->CollectionAttributeAttribute->AttributeDataType->DataTypeComponent",
         defaultValue: "FormLayoutAttributeAttribute->CollectionAttributeComponent:properties.id||FormLayoutAttributeAttribute->CollectionAttributeAttribute->AttributeComponent:properties.id"
        },
        { id: "title", dataType: "String",  defaultValue: "->FormLayoutAttributeAttribute:properties.title||FormLayoutAttributeAttribute->CollectionAttributeAttribute:properties.title"  },
        { id: "unique", dataType: "Boolean",  defaultValue: "->FormLayoutAttributeAttribute:properties.unique||FormLayoutAttributeAttribute->CollectionAttributeAttribute:properties.unique"  },
        { id: "required", dataType: "Boolean",  defaultValue: "->FormLayoutAttributeAttribute:properties.required||FormLayoutAttributeAttribute->CollectionAttributeAttribute:properties.required"  },
        { id: "readonly", dataType: "Boolean",  defaultValue: "->FormLayoutAttributeAttribute:properties.readonly||FormLayoutAttributeAttribute->CollectionAttributeAttribute:properties.readonly"  },
        { id: "disabled", dataType: "Boolean",  defaultValue: "->FormLayoutAttributeAttribute:properties.disabled||FormLayoutAttributeAttribute->CollectionAttributeAttribute:properties.disabled"  },
       ],
      },
      {
       id: "Child",
       label: "Children",
       component: 'Table',
       columns: [
        {
         id: "Collection",
         component: "Select",
         displayExpr: "->CollectionChildCollection:properties.id",
         collection: "FormLayoutChild<-FormLayoutCollection->CollectionChild",
        },
        {
         id: "tab",
         component: "Select",
         collection: "FormLayoutChild<-FormLayoutCollection->CollectionTab",
         displayExpr: "properties.id",
         defaultValue: "FormLayoutChildCollection->CollectionChildTab:properties.id"
        },
        {
         id: "group",
         component: "Select",
         collection: "FormLayoutChild<-FormLayoutCollection->CollectionGroup",
         displayExpr: "properties.id",
         defaultValue: "FormLayoutChildCollection->CollectionChildGroup:properties.id"
        },
        {
         id: "attribute",
         component: "Table",
         columns: [
          {
           id: "attribute",
           component: "Select",
           displayExpr: "->CollectionAttributeAttribute:properties.id",
           collection: "FormLayoutChildAttribute<-FormLayoutChildCollection->CollectionChildCollection->CollectionAttribute",
          },
          {
           id: "dataType",
           component: "Select",
           collection: "DataType",
           displayExpr: "properties.id",
           hidden: true,
           defaultValue: "FormLayoutChildAttributeAttribute->CollectionAttributeAttribute->AttributeDataType:properties.id",
          },
          {
           id: "component",
           component: "Select",
           displayExpr: "properties.id",
           collection: "FormLayoutChildAttributeAttribute->CollectionAttributeAttribute->AttributeDataType->DataTypeComponent",
           defaultValue: "FormLayoutChildAttributeAttribute->CollectionAttributeComponent:properties.id||FormLayoutChildAttributeAttribute->CollectionAttributeAttribute->AttributeComponent:properties.id"
          },
          { id: "title", dataType: "String",  defaultValue: "->FormLayoutChildAttributeAttribute:properties.title||FormLayoutChildAttributeAttribute->CollectionAttributeAttribute:properties.title"  },
          { id: "unique", dataType: "Boolean",  defaultValue: "->FormLayoutChildAttributeAttribute:properties.unique||FormLayoutChildAttributeAttribute->CollectionAttributeAttribute:properties.unique"  },
          { id: "required", dataType: "Boolean",  defaultValue: "->FormLayoutChildAttributeAttribute:properties.required||FormLayoutChildAttributeAttribute->CollectionAttributeAttribute:properties.required"  },
          { id: "readonly", dataType: "Boolean",  defaultValue: "->FormLayoutChildAttributeAttribute:properties.readonly||FormLayoutChildAttributeAttribute->CollectionAttributeAttribute:properties.readonly"  },
          { id: "disabled", dataType: "Boolean",  defaultValue: "->FormLayoutChildAttributeAttribute:properties.disabled||FormLayoutChildAttributeAttribute->CollectionAttributeAttribute:properties.disabled"  },
         ],
        }
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