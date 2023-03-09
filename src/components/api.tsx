import { FormMetaData } from "./input/Form";

/* use in c++
export const JSONToCypherMap = (json: object) => {
  // https://stackoverflow.com/questions/20841571/how-to-solve-the-dilemma-while-handle-json-in-neo4j-cypher
  return jju.stringify(json, { quote: "'" }).replace(/"/g, "\\x22");
};
*/

export const AttrsTableData: { [key: string]: FormMetaData } = {
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
      collection: "Comp"
     }
    },
    {
     id: "Comp",
     title: "Component",
     component: "Tag",
     props: {
      displayExpr: "properties.id",
      collection: "Comp"
     }
    }
   ]
  },
 "Comp": {
  title: "Component",
  id: "Comp",
  attributes: [
   { id: "id", component: "TextInput" },
   {
    id: "Prop",
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
       onchange: "[\"Comp\",null]"
      },
     },
     {
      id: "Comp",
      title: "Component",
      component: "Select",
      props: {
       displayExpr: "properties.id",
       collection: "->$0DataType->DataTypeComp",
      },
     },
     {
      id: "value",
      // component: "MetaAttr<-MetaAttr[*properties:id=type]:properties.id",
      component: "->$0Comp:properties.id",
     }
    ]
   }
  ]
 },
 "Attr": {
  title: "Attribute", id: "Attr", attributes: [
   { id: "id", component: "TextInput" },
   {
    id: "dataType",
    component: "Select",
    props: {
     displayExpr: "properties.id",
     collection: "DataType",
     onchange: "[\"Comp\",null]"
    },
   },
   {
    id: "Comp",
    title: "Component",
    component: "Select",
    props: {
     displayExpr: "properties.id",
     collection: "->AttrDataType->DataTypeComp",
    },
   },
   { id: "title", component: "TextInput" },
   { id: "unique", component: "CheckBox" },
   { id: "required", component: "CheckBox" },
   { id: "disabled", component: "CheckBox" },  {
    id: "Prop",
    component: "Table",
    attributes: [
     {
      id: "key",
      component: "Select",
      props: {
       displayExpr: "properties.key",
       collection: "AttrProp<-AttrComp->CompProp",
      },
     },
     {
      id: "value",
      component: "->AttrPropKey->CompPropComp:properties.id",
     }
    ]
   }
  ]
 },
 "CollCategory": {
  title: "Collection Category",
  id: "CollCategory",
  attributes: [
   { id: "id", component: "TextInput" },
   { id: "description", component: "TextArea" }
  ]
 },

 // TODO: Coll has only one Attr. Add validation for that.
 "Coll": {
  title: "Collection",
  id: "Coll",
  attributes: [
   { id: "id", component: "TextInput" },
   {
    id: "category",
    component: "Select",
    props: {
     displayExpr: "properties.id",
     collection: "CollCategory",
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
    id: "Attr",
    component: "Table",
    tab: "Attribute",
    attributes: [
     {
      id: "Attr",
      title: "Attribute",
      component: "Select",
      props: {
       displayExpr: "properties.id",
       collection: "Attr",
      },

     },
     {
      id: "tab",
      component: "Select",
      props: {
       displayExpr: "properties.id",
       collection: "CollAttr<-CollTab",
      },
     },
     {
      id: "group",
      component: "Select",
      props: {
       collection: "CollAttr<-CollGroup",
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
       defaultValue: "->CollAttrAttr->AttrDataType:properties.id"
      },
     },
     {
      id: "Comp",
      component: "Select",
      props: {
       displayExpr: "properties.id",
       collection: "->CollAttrAttr->AttrDataType->DataTypeComp",
       defaultValue: "->CollAttrAttr->AttrComp:properties.id"
      },
     },
     {
      id: "title",
      component: "TextInput",
      props: {
       defaultValue: "->CollAttrAttr:properties.title"
      },
     },
     {
      id: "unique",
      component: "CheckBox",
      props: {
       defaultValue: "->CollAttrAttr:properties.unique"
      },
     },
     {
      id: "required",
      component: "CheckBox",
      props: {
       defaultValue: "->CollAttrAttr:properties.required"
      },
     },
     {
      id: "disabled",
      component: "CheckBox",
      props: {
       defaultValue: "->CollAttrAttr:properties.disabled"
      },
     },  {
      id: "Prop",
      title: "Property",
      component: "Table",
      attributes: [
       {
        id: "key",
        component: "Select",
        props: {
         displayExpr: "properties.key",
         collection: "CollAttrProp<-CollAttrComp->CompProp||CollAttrProp<-CollAttrAttr->AttrComp->CompProp",
        },
       },
       {
        id: "value",
        component: "->CollAttrPropKey->CompPropComp:properties.id",
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
       collection: "Coll",
      },
     },
     {
      id: "tab",
      component: "Select",
      props: {
       displayExpr: "properties.id",
       collection: "CollChild<-CollTab",
      },
     },
     {
      id: "group",
      component: "Select",
      props: {
       collection: "CollChild<-CollGroup",
       displayExpr: "properties.id",
      },
     },  {
      id: "Prop",
      title: "Property",
      component: "Table",
      attributes: [
       {
        id: "key",
        component: "Select",
        props: {
         displayExpr: "properties.key",
         collection: "Comp[Table]->CompProp",
        },
       },
       {
        id: "value",
        component: "->CollChildPropKey->CompPropComp:properties.id",
       }
      ]
     }
    ]
   }
  ]
 },

 "Form": {
  title: "Form", id: "Form", attributes: [
   { id: "id", component: "TextInput" },
   { id: "title", component: "TextInput" },
   { id: "description", component: "TextArea" },
   { id: "table", component: "CheckBox" },
   {
    id: "collection",
    component: "Select",
    props: {
     displayExpr: "properties.id",
     collection: "Coll",
     inward: true
    },
   },
   {
    id: "Attr",
    title: "Attribute",
    component: "Table",
    tab: "Attribute",
    attributes: [
     {
      id: "Attr",
      title: "Attribute",
      component: "Select",
      props: {
       displayExpr: "->CollAttrAttr:properties.id",
       collection: "CollForm<-FormAttr<-CollAttr"
      },
     },
     {
      id: "tab",
      component: "Select",
      props: {
       collection: "CollForm<-FormAttr<-CollTab",
       displayExpr: "properties.id",
       defaultValue: "FormAttrAttr->CollAttrTab:properties.id"
      },
     },
     {
      id: "group",
      component: "Select",
      props: {
       collection: "CollForm<-FormAttr<-CollGroup",
       displayExpr: "properties.id",
       defaultValue: "FormAttrAttr->CollAttrGroup:properties.id"
      },
     },
     {
      id: "dataType",
      component: "Select",
      props: {
       collection: "DataType",
       displayExpr: "properties.id",
       hidden: true,
       defaultValue: "FormAttrAttr->CollAttrAttr->AttrDataType:properties.id"
      },
     },
     {
      id: "Comp",
      title: "Component",
      component: "Select",
      props: {
       displayExpr: "properties.id",
       collection: "->FormAttrAttr->CollAttrAttr->AttrDataType->DataTypeComp",
       defaultValue: "FormAttrAttr->CollAttrComp:properties.id||FormAttrAttr->CollAttrAttr->AttrComp:properties.id"
      },

     },
     {
      id: "title",
      component: "TextInput",
      props: {
       defaultValue: "->FormAttrAttr:properties.title||FormAttrAttr->CollAttrAttr:properties.title"
      }
     },
     {
      id: "required",
      component: "CheckBox",
      props: {
       defaultValue: "->FormAttrAttr:properties.required||FormAttrAttr->CollAttrAttr:properties.required"
      }
     },
     {
      id: "disabled",
      component: "CheckBox",
      props: {
       defaultValue: "->FormAttrAttr:properties.disabled||FormAttrAttr->CollAttrAttr:properties.disabled"
      }
     },  {
      id: "Prop",
      title: "Property",
      component: "Table",
      attributes: [
       {
        id: "key",
        component: "Select",
        props: {
         displayExpr: "properties.key",
         collection: "FormAttrProp<-FormAttrComp->CompProp||FormAttrProp<-FormAttrAttr->CollAttrAttr->AttrComp->CompProp",
        },
       },
       {
        id: "value",
        component: "->FormAttrPropKey->CompPropComp:properties.id",
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
      id: "Coll",
      title: "Collection",
      component: "Select",
      props: {
       displayExpr: "->CollChildColl:properties.id",
       collection: "CollForm<-FormChild<-CollChild"
      },

     },
     {
      id: "tab",
      component: "Select",
      props: {
       collection: "CollForm<-FormChild<-CollTab",
       displayExpr: "properties.id",
       defaultValue: "FormChildColl->CollChildTab:properties.id"
      },
     },
     {
      id: "group",
      component: "Select",
      props: {
       collection: "CollForm<-FormChild<-CollGroup",
       displayExpr: "properties.id",
       defaultValue: "FormChildColl->CollChildGroup:properties.id"
      },
     },
     {
      id: "Attr",
      title: "Attribute",
      component: "Table",
      attributes: [
       {
        id: "Attr",
        title: "Attribute",
        component: "Select",
        props: {
         displayExpr: "->CollAttrAttr:properties.id",
         collection: "FormChildAttr<-FormChildColl->CollChildColl->CollAttr"
        },

       },
       {
        id: "dataType",
        component: "Select",
        props: {
         collection: "DataType",
         displayExpr: "properties.id",
         hidden: true,
         defaultValue: "FormChildAttrAttr->CollAttrAttr->AttrDataType:properties.id"
        },

       },
       {
        id: "Comp",
        title: "Component",
        component: "Select",
        props: {
         displayExpr: "properties.id",
         collection: "->FormChildAttrAttr->CollAttrAttr->AttrDataType->DataTypeComp",
         defaultValue: "FormChildAttrAttr->CollAttrComp:properties.id||FormChildAttrAttr->CollAttrAttr->AttrComp:properties.id"
        },
       },
       {
        id: "title",
        component: "TextInput",
        props: {
         defaultValue: "->FormChildAttrAttr:properties.title||FormChildAttrAttr->CollAttrAttr:properties.title"
        }
       },
       {
        id: "required",
        component: "CheckBox",
        props: {
         defaultValue: "->FormChildAttrAttr:properties.required||FormChildAttrAttr->CollAttrAttr:properties.required"
        }
       },
       {
        id: "disabled",
        component: "CheckBox",
        props: {
         defaultValue: "->FormChildAttrAttr:properties.disabled||FormChildAttrAttr->CollAttrAttr:properties.disabled"
        }
       },
       {
        id: "child",
        component: "Select",
        props: {
         displayExpr: "properties.id",
         collection: "Form"
        },
       },
       {
        id: "Prop",
        component: "Table",
        attributes: [
         {
          id: "key",
          component: "Select",
          props: {
           displayExpr: "properties.key",
           collection: "FormChildAttrProp<-FormChildAttrComp->CompProp||FormChildAttrProp<-FormChildAttrAttr->CollAttrAttr->AttrComp->CompProp",
          },
         },
         {
          id: "value",
          component: "->FormChildAttrPropKey->CompPropComp:properties.id",
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

// window.a = AttrsTableData;