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
   id: "DataType",
   attributes: [
    { id: "id", component: "TextInput" },
    {
     id: "default",
     component: "Select",
     props: {
      displayExpr: "properties.id",
      collection: "Component"
     }
    },
    {
     id: "Component",
     component: "Tag",
     props: {
      displayExpr: "properties.id",
      collection: "Component"
     }
    }
   ]
  },
 "Component": {
  title: "Component",
  id: "Component",
  attributes: [
   { id: "id", component: "TextInput" },
   {
    id: "Property",
    component: "Table",
    tab: 'Properties',
    attributes: [
     {
      id: "key",
      component: "TextInput"
     },
     {
      id: "dataType",
      component: "Select",
      props: {
       displayExpr: "properties.id",
       collection: "DataType",
       onchange: "[\"component\",null]"
      },
     },
     {
      id: "component",
      component: "Select",
      props: {
       displayExpr: "properties.id",
       collection: "->ComponentPropertyDataType->DataTypeComponent",
      },
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
  title: "Attribute", id: "Attribute", attributes: [
   { id: "id", component: "TextInput" },
   {
    id: "dataType",
    component: "Select",
    props: {
     displayExpr: "properties.id",
     collection: "DataType",
     onchange: "[\"component\",null]"
    },
   },
   {
    id: "component",
    component: "Select",
    props: {
     displayExpr: "properties.id",
     collection: "->AttributeDataType->DataTypeComponent",
    },
   },
   { id: "title", component: "TextInput" },
   { id: "unique", component: "CheckBox" },
   { id: "required", component: "CheckBox" },
   { id: "disabled", component: "CheckBox" },  {
    id: "Property",
    component: "Table",
    attributes: [
     {
      id: "key",
      component: "Select",
      props: {
       displayExpr: "properties.key",
       collection: "AttributeProperty<-AttributeComponent->ComponentProperty",
      },
     },
     {
      id: "value",
      component: "->AttributePropertyKey->ComponentPropertyComponent:properties.id",
     }
    ]
   }
  ]
 },
 "CollectionCategory": {
  title: "Collection Category",
  id: "CollectionCategory",
  attributes: [
   { id: "id", component: "TextInput" },
   { id: "description", component: "TextArea" }
  ]
 },

 // TODO: Collection has only one attribute. Add validation for that.
 "Collection": {
  title: "Collection",
  id: "Collection",
  attributes: [
   { id: "id", component: "TextInput" },
   {
    id: "category",
    component: "Select",
    props: {
     displayExpr: "properties.id",
     collection: "CollectionCategory",
    },
   },
   { id: "description", component: "TextArea" },
   {
    id: "Tab",
    component: "Table",
    tab: 'Organize',
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
    tab: 'Organize',
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
      id: "Role",
      component: "Table",
      tab: "Permission",
      attributes: [
       {
        id: "role",
        component: "Select",
        props: {
         displayExpr: "properties.id",
         collection: "Role"
        },
       },
       {
        id: "Perm",
        component: "Table",
        attributes: [
         {
          id: "perm",
          component: "Select",
          props: {
           displayExpr: "properties.id",
           collection: "Perm"
          },
         },
        ]
       }
      ]
     },
   {
    id: "Attribute",
    component: "Table",
    tab: "Attribute",
    attributes: [
     {
      id: "attribute",
      component: "Select",
      props: {
       displayExpr: "properties.id",
       collection: "Attribute",
      },

     },
     {
      id: "tab",
      component: "Select",
      props: {
       displayExpr: "properties.id",
       collection: "CollectionAttribute<-CollectionTab",
      },
     },
     {
      id: "group",
      component: "Select",
      props: {
       collection: "CollectionAttribute<-CollectionGroup",
       displayExpr: "properties.id",
      },
     },
     {
      id: "dataType",
      component: "Select",
      props: {
       displayExpr: "properties.id",
       collection: "DataType",
       hidden: true,
       disabled: true,
       defaultValue: "->CollectionAttributeAttribute->AttributeDataType:properties.id"
      },
     },
     {
      id: "component",
      component: "Select",
      props: {
       displayExpr: "properties.id",
       collection: "->CollectionAttributeAttribute->AttributeDataType->DataTypeComponent",
       defaultValue: "->CollectionAttributeAttribute->AttributeComponent:properties.id"
      },
     },
     {
      id: "title",
      component: "TextInput",
      props: {
       defaultValue: "->CollectionAttributeAttribute:properties.title"
      },
     },
     {
      id: "unique",
      component: "CheckBox",
      props: {
       defaultValue: "->CollectionAttributeAttribute:properties.unique"
      },
     },
     {
      id: "required",
      component: "CheckBox",
      props: {
       defaultValue: "->CollectionAttributeAttribute:properties.required"
      },
     },
     {
      id: "disabled",
      component: "CheckBox",
      props: {
       defaultValue: "->CollectionAttributeAttribute:properties.disabled"
      },
     },  {
      id: "Property",
      component: "Table",
      attributes: [
       {
        id: "key",
        component: "Select",
        props: {
         displayExpr: "properties.key",
         collection: "CollectionAttributeProperty<-CollectionAttributeComponent->ComponentProperty||CollectionAttributeProperty<-CollectionAttributeAttribute->AttributeComponent->ComponentProperty",
        },
       },
       {
        id: "value",
        component: "->CollectionAttributePropertyKey->ComponentPropertyComponent:properties.id",
       }
      ]
    },  {
      id: "Role",
      component: "Table",
      attributes: [
       {
        id: "role",
        component: "Select",
        props: {
         displayExpr: "properties.id",
         collection: "Role"
        },
       },
       {
        id: "Perm",
        component: "Table",
        attributes: [
         {
          id: "perm",
          component: "Select",
          props: {
           displayExpr: "properties.id",
           collection: "Perm"
          },
         },
        ]
       }
      ]
     }
   ]

   },
   {
    id: "Child",
    component: "Table",
    tab: "Child",
    attributes: [
     {
      id: "collection",
      component: "Select",
      props: {
       displayExpr: "properties.id",
       collection: "Collection",
      },
     },
     {
      id: "tab",
      component: "Select",
      props: {
       displayExpr: "properties.id",
       collection: "CollectionChild<-CollectionTab",
      },
     },
     {
      id: "group",
      component: "Select",
      props: {
       collection: "CollectionChild<-CollectionGroup",
       displayExpr: "properties.id",
      },
     },  {
      id: "Property",
      component: "Table",
      attributes: [
       {
        id: "key",
        component: "Select",
        props: {
         displayExpr: "properties.key",
         collection: "Component[Table]->ComponentProperty",
        },
       },
       {
        id: "value",
        component: "->CollectionChildPropertyKey->ComponentPropertyComponent:properties.id",
       }
      ]
     }
    ]
   }
  ]
 },

 "FormLayout": {
  title: "FormLayout1", id: "FormLayout", attributes: [
   { id: "id", component: "TextInput" },
   { id: "title", component: "TextInput" },
   { id: "description", component: "TextArea" },
   { id: "table", component: "CheckBox" },
   {
    id: "collection",
    component: "Select",
    props: {
     displayExpr: "properties.id",
     collection: "Collection",
     inward: true
    },
   },
   {
    id: "Attribute",
    component: "Table",
    tab: "Attribute",
    attributes: [
     {
      id: "attribute",
      component: "Select",
      props: {
       displayExpr: "->CollectionAttributeAttribute:properties.id",
       collection: "CollectionFormLayout<-FormLayoutAttribute<-CollectionAttribute"
      },
     },
     {
      id: "tab",
      component: "Select",
      props: {
       collection: "CollectionFormLayout<-FormLayoutAttribute<-CollectionTab",
       displayExpr: "properties.id",
       defaultValue: "FormLayoutAttributeAttribute->CollectionAttributeTab:properties.id"
      },
     },
     {
      id: "group",
      component: "Select",
      props: {
       collection: "CollectionFormLayout<-FormLayoutAttribute<-CollectionGroup",
       displayExpr: "properties.id",
       defaultValue: "FormLayoutAttributeAttribute->CollectionAttributeGroup:properties.id"
      },
     },
     {
      id: "dataType",
      component: "Select",
      props: {
       collection: "DataType",
       displayExpr: "properties.id",
       hidden: true,
       defaultValue: "FormLayoutAttributeAttribute->CollectionAttributeAttribute->AttributeDataType:properties.id"
      },
     },
     {
      id: "component",
      component: "Select",
      props: {
       displayExpr: "properties.id",
       collection: "FormLayoutAttributeAttribute->CollectionAttributeAttribute->AttributeDataType->DataTypeComponent",
       defaultValue: "FormLayoutAttributeAttribute->CollectionAttributeComponent:properties.id||FormLayoutAttributeAttribute->CollectionAttributeAttribute->AttributeComponent:properties.id"
      },

     },
     {
      id: "title",
      component: "TextInput",
      props: {
       defaultValue: "->FormLayoutAttributeAttribute:properties.title||FormLayoutAttributeAttribute->CollectionAttributeAttribute:properties.title"
      }
     },
     {
      id: "required",
      component: "CheckBox",
      props: {
       defaultValue: "->FormLayoutAttributeAttribute:properties.required||FormLayoutAttributeAttribute->CollectionAttributeAttribute:properties.required"
      }
     },
     {
      id: "disabled",
      component: "CheckBox",
      props: {
       defaultValue: "->FormLayoutAttributeAttribute:properties.disabled||FormLayoutAttributeAttribute->CollectionAttributeAttribute:properties.disabled"
      }
     },  {
      id: "Property",
      component: "Table",
      attributes: [
       {
        id: "key",
        component: "Select",
        props: {
         displayExpr: "properties.key",
         collection: "FormLayoutAttributeProperty<-FormLayoutAttributeComponent->ComponentProperty||FormLayoutAttributeProperty<-FormLayoutAttributeAttribute->CollectionAttributeAttribute->AttributeComponent->ComponentProperty",
        },
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
    attributes: [
     {
      id: "Collection",
      component: "Select",
      props: {
       displayExpr: "->CollectionChildCollection:properties.id",
       collection: "CollectionFormLayout<-FormLayoutChild<-CollectionChild"
      },

     },
     {
      id: "tab",
      component: "Select",
      props: {
       collection: "CollectionFormLayout<-FormLayoutChild<-CollectionTab",
       displayExpr: "properties.id",
       defaultValue: "FormLayoutChildCollection->CollectionChildTab:properties.id"
      },
     },
     {
      id: "group",
      component: "Select",
      props: {
       collection: "CollectionFormLayout<-FormLayoutChild<-CollectionGroup",
       displayExpr: "properties.id",
       defaultValue: "FormLayoutChildCollection->CollectionChildGroup:properties.id"
      },
     },
     {
      id: "attribute",
      component: "Table",
      attributes: [
       {
        id: "attribute",
        component: "Select",
        props: {
         displayExpr: "->CollectionAttributeAttribute:properties.id",
         collection: "FormLayoutChildAttribute<-FormLayoutChildCollection->CollectionChildCollection->CollectionAttribute"
        },

       },
       {
        id: "dataType",
        component: "Select",
        props: {
         collection: "DataType",
         displayExpr: "properties.id",
         hidden: true,
         defaultValue: "FormLayoutChildAttributeAttribute->CollectionAttributeAttribute->AttributeDataType:properties.id"
        },

       },
       {
        id: "component",
        component: "Select",
        props: {
         displayExpr: "properties.id",
         collection: "->FormLayoutChildAttributeAttribute->CollectionAttributeAttribute->AttributeDataType->DataTypeComponent",
         defaultValue: "FormLayoutChildAttributeAttribute->CollectionAttributeComponent:properties.id||FormLayoutChildAttributeAttribute->CollectionAttributeAttribute->AttributeComponent:properties.id"
        },
       },
       {
        id: "title",
        component: "TextInput",
        props: {
         defaultValue: "->FormLayoutChildAttributeAttribute:properties.title||FormLayoutChildAttributeAttribute->CollectionAttributeAttribute:properties.title"
        }
       },
       {
        id: "required",
        component: "CheckBox",
        props: {
         defaultValue: "->FormLayoutChildAttributeAttribute:properties.required||FormLayoutChildAttributeAttribute->CollectionAttributeAttribute:properties.required"
        }
       },
       {
        id: "disabled",
        component: "CheckBox",
        props: {
         defaultValue: "->FormLayoutChildAttributeAttribute:properties.disabled||FormLayoutChildAttributeAttribute->CollectionAttributeAttribute:properties.disabled"
        }
       },
       {
        id: "child",
        component: "Select",
        props: {
         displayExpr: "properties.id",
         collection: "FormLayout"
        },
       },
       {
        id: "Property",
        component: "Table",
        attributes: [
         {
          id: "key",
          component: "Select",
          props: {
           displayExpr: "properties.key",
           collection: "FormLayoutChildAttributeProperty<-FormLayoutChildAttributeComponent->ComponentProperty||FormLayoutChildAttributeProperty<-FormLayoutChildAttributeAttribute->CollectionAttributeAttribute->AttributeComponent->ComponentProperty",
          },
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
 "User": {
   title: "User",
   id: "User",
   attributes: [
    { id: "id", component: "TextInput" },
    {
     id: "role",
     component: "Tag",
     props: {
      displayExpr: "properties.id",
      collection: "Role"
     }
    }
   ]
  },
 "Perm":
  {
   title: "Perm",
   id: "Perm",
   attributes: [
    { id: "id", component: "TextInput" },
   ]
  },
 "Role":
  {
   title: "Role",
   id: "Role",
   attributes: [
    { id: "id", component: "TextInput" },
   ]
  },
// TODO: Dynamic Filter on Grid: Role->Filter
};

// window.a = AttributesTableData;