import { FormMetaData } from "./input/Form";

/* use in c++
export const JSONToCypherMap = (json: object) => {
  // https://stackoverflow.com/questions/20841571/how-to-solve-the-dilemma-while-handle-json-in-neo4j-cypher
  return jju.stringify(json, { quote: "'" }).replace(/"/g, "\\x22");
};
*/

export const AttributesTableData: { [key: string]: FormMetaData } = {
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
     collection: "Component"
    },
    {
     id: "Component",
     component: "Tag",
     displayExpr: "properties.id",
     collection: "Component"
    }
   ]
  },
 "Component": {
  title: "Component",
  label: "Component",
  attributes: [
   { id: "id", component: "TextInput" },
   {
    id: "Property",
    component: "Table",
    tab: 'Properties',
    columns: [
     {
      id: "key",
      component: "TextInput"
     },
     {
      id: "dataType",
      component: "Select",
      displayExpr: "properties.id",
      collection: "DataType",
      onchange: "[\"component\",null]"
     },
     {
      id: "component",
      component: "Select",
      collection: "ComponentPropertyDataType->DataTypeComponent",
      displayExpr: "properties.id"
     },
     {
      id: "value",
      // component: "MetaAttribute<-MetaAttribute[*properties:id=type]:properties.id",
      component: "->ComponentPropertyComponent:properties.id",
     }
    ]
   }
  ]
 },
 "Attribute": {
  title: "Attribute", label: "Attribute", attributes: [
   { id: "id", component: "TextInput" },
   {
    id: "dataType",
    component: "Select",
    displayExpr: "properties.id",
    collection: "DataType",
    onchange: "[\"component\",null]"
   },
   {
    id: "component",
    component: "Select",
    collection: "AttributeDataType->DataTypeComponent",
    displayExpr: "properties.id"
   },
   { id: "title", component: "TextInput" },
   { id: "unique", component: "CheckBox" },
   { id: "required", component: "CheckBox" },
   { id: "disabled", component: "CheckBox" }
  ]
 },
 "CollectionCategory": {
  title: "Collection Category",
  label: "CollectionCategory",
  attributes: [
   { id: "id", component: "TextInput" },
   { id: "description", component: "TextArea" }
  ]
 },

 // TODO: Collection has only one attribute. Add validation for that.
 "Collection": {
  title: "Collection",
  label: "Collection",
  attributes: [
   { id: "id", component: "TextInput" },
   {
    id: "category",
    component: "Select",
    collection: "CollectionCategory",
    displayExpr: "properties.id"
   },
   { id: "description", component: "TextArea" },
   {
    id: "Tab",
    component: "Table",
    tab: 'Organize',
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
    tab: 'Organize',
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
    component: "Table",
    tab: "Attribute",
    columns: [
     {
      id: "attribute",
      component: "Select",
      collection: "Attribute",
      displayExpr: "properties.id"

     },
     {
      id: "tab",
      component: "Select",
      collection: "CollectionAttribute<-CollectionTab",
      displayExpr: "properties.id"

     },
     {
      id: "group",
      component: "Select",
      collection: "CollectionAttribute<-CollectionGroup",
      displayExpr: "properties.id"

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
     {
      id: "title",
      component: "TextInput",
      defaultValue: "->CollectionAttributeAttribute:properties.title"
     },
     {
      id: "unique",
      component: "CheckBox",
      defaultValue: "->CollectionAttributeAttribute:properties.unique"
     },
     {
      id: "required",
      component: "CheckBox",
      defaultValue: "->CollectionAttributeAttribute:properties.required"
     },
     {
      id: "disabled",
      component: "CheckBox",
      defaultValue: "->CollectionAttributeAttribute:properties.disabled"
     },  {
      id: "Property",
      component: "Table",
      columns: [
       {
        id: "key",
        component: "Select",
        displayExpr: "properties.key",
        collection: "CollectionAttributeProperty<-CollectionAttributeComponent->ComponentProperty||CollectionAttributeProperty<-CollectionAttributeAttribute->AttributeComponent->ComponentProperty",
       },
       {
        id: "value",
        component: "->CollectionAttributePropertyKey->ComponentPropertyComponent:properties.id",
       }
      ]
    }
   ]

   },
   {
    id: "Child",
    component: "Table",
    tab: "Child",
    columns: [
     {
      id: "collection",
      component: "Select",
      collection: "Collection",
      displayExpr: "properties.id"

     },
     {
      id: "tab",
      component: "Select",
      collection: "CollectionChild<-CollectionTab",
      displayExpr: "properties.id"

     },
     {
      id: "group",
      component: "Select",
      collection: "CollectionChild<-CollectionGroup",
      displayExpr: "properties.id"

     }
    ]
   }
  ]
 },

 "FormLayout": {
  title: "FormLayout1", label: "FormLayout", attributes: [
   { id: "id", component: "TextInput" },
   { id: "title", component: "TextInput" },
   { id: "description", component: "TextArea" },
   {
    id: "collection",
    component: "Select",
    collection: "Collection",
    displayExpr: "properties.id"
   },
   {
    id: "Attribute",
    component: "Table",
    tab: "Attribute",
    columns: [
     {
      id: "attribute",
      component: "Select",
      displayExpr: "->CollectionAttributeAttribute:properties.id",
      collection: "FormLayoutAttribute<-FormLayoutCollection->CollectionAttribute"
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
     {
      id: "title",
      component: "TextInput",
      defaultValue: "->FormLayoutAttributeAttribute:properties.title||FormLayoutAttributeAttribute->CollectionAttributeAttribute:properties.title"
     },
     {
      id: "required",
      component: "CheckBox",
      defaultValue: "->FormLayoutAttributeAttribute:properties.required||FormLayoutAttributeAttribute->CollectionAttributeAttribute:properties.required"
     },
     {
      id: "disabled",
      component: "CheckBox",
      defaultValue: "->FormLayoutAttributeAttribute:properties.disabled||FormLayoutAttributeAttribute->CollectionAttributeAttribute:properties.disabled"
     },  {
      id: "Property",
      component: "Table",
      columns: [
       {
        id: "key",
        component: "Select",
        displayExpr: "properties.key",
        collection: "FormLayoutAttributeProperty<-FormLayoutAttributeComponent->ComponentProperty||FormLayoutAttributeProperty<-FormLayoutAttributeAttribute->CollectionAttributeAttribute->AttributeComponent->ComponentProperty",
       },
       {
        id: "value",
        component: "->FormLayoutAttributePropertyKey->ComponentPropertyComponent:properties.id",
       }
      ]
     }
    ]
   },
   {
    id: "Child",
    title: "Children",
    component: "Table",
    tab: "Children",
    columns: [
     {
      id: "Collection",
      component: "Select",
      displayExpr: "->CollectionChildCollection:properties.id",
      collection: "FormLayoutChild<-FormLayoutCollection->CollectionChild"
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
        collection: "FormLayoutChildAttribute<-FormLayoutChildCollection->CollectionChildCollection->CollectionAttribute"
       },
       {
        id: "dataType",
        component: "Select",
        collection: "DataType",
        displayExpr: "properties.id",
        hidden: true,
        defaultValue: "FormLayoutChildAttributeAttribute->CollectionAttributeAttribute->AttributeDataType:properties.id"
       },
       {
        id: "component",
        component: "Select",
        displayExpr: "properties.id",
        collection: "FormLayoutChildAttributeAttribute->CollectionAttributeAttribute->AttributeDataType->DataTypeComponent",
        defaultValue: "FormLayoutChildAttributeAttribute->CollectionAttributeComponent:properties.id||FormLayoutChildAttributeAttribute->CollectionAttributeAttribute->AttributeComponent:properties.id"
       },
       {
        id: "title",
        component: "TextInput",
        defaultValue: "->FormLayoutChildAttributeAttribute:properties.title||FormLayoutChildAttributeAttribute->CollectionAttributeAttribute:properties.title"
       },
       {
        id: "required",
        component: "CheckBox",
        defaultValue: "->FormLayoutChildAttributeAttribute:properties.required||FormLayoutChildAttributeAttribute->CollectionAttributeAttribute:properties.required"
       },
       {
        id: "disabled",
        component: "CheckBox",
        defaultValue: "->FormLayoutChildAttributeAttribute:properties.disabled||FormLayoutChildAttributeAttribute->CollectionAttributeAttribute:properties.disabled"
       },  {
        id: "Property",
        component: "Table",
        columns: [
         {
          id: "key",
          component: "Select",
          displayExpr: "properties.key",
          collection: "FormLayoutChildAttributeProperty<-FormLayoutChildAttributeComponent->ComponentProperty||FormLayoutChildAttributeProperty<-FormLayoutChildAttributeAttribute->CollectionAttributeAttribute->AttributeComponent->ComponentProperty",
         },
         {
          id: "value",
          component: "->FormLayoutChildAttributePropertyKey->ComponentPropertyComponent:properties.id",
         }
        ]
       }
      ]
     }
    ]
   }
  ]
 },
 "TableLayout": {

  title: "FormLayout1",
  label: "TableLayout",
  attributes: [
   { id: "id", component: "TextInput" }
  ]
 }
};

// window.a = AttributesTableData;