import { FormMetaData } from "./Form";

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
    { id: "id", component: "TextBoxField" },
    {
     id: "default",
     component: "SelectBoxField",
     props: {
      displayExpr: "properties.id",
      collection: "Comp"
     }
    },
    {
     id: "Comp",
     title: "Component",
     component: "TagBoxField",
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
   { id: "id", component: "TextBoxField" },
   {
    id: "child",
    title: "Parent Component",
    component: "SelectBoxField",
    props: {
     displayExpr: "properties.id",
     collection: "Comp",
     inward: true
    },
   },
   {
    id: "Prop",
    component: "TableField",
    tab: 'Properties',
    attributes: [
     {
      id: "key",
      component: "TextBoxField"
     },
     {
      id: "dataType",
      component: "SelectBoxField",
      props: {
       displayExpr: "properties.id",
       collection: "DataType",
       onchange: "[\"Comp\",null]"
      },
     },
     {
      id: "Comp",
      title: "Component",
      component: "SelectBoxField",
      props: {
       displayExpr: "properties.id",
       collection: "->$0DataType->DataTypeComp",
      },
     },
     {
      id: "valueProp",
      title: "Value Property",
      component: "TableField",
      tab: 'Properties',
      attributes: [
       {
        id: "key",
        component: "SelectBoxField",
        props: {
         displayExpr: "properties.key",
         collection: "$0<-$0Comp->$0Prop",
        },
       },
       {
        id: "value",
        component: "->$0Key->$0Comp:properties.id",
       }
      ]
     },
     {
      id: "value",
      // component: "MetaAttr<-MetaAttr[*properties:id=type]:properties.id",
      meta: "->$0ValueProp",
      component: "->$0Comp:properties.id",
     }
    ]
   }
  ]
 },
 "AttrType": {
  title: "Attribute", id: "Attr", attributes: [
   { id: "id", component: "TextBoxField" },
   { id: "description", component: "TextAreaField" },
  ]
 },
 "Attr": {
  title: "Attribute", id: "Attr", attributes: [
   { id: "id", component: "TextBoxField" },
   {
    id: "dataType",
    component: "SelectBoxField",
    props: {
     displayExpr: "properties.id",
     collection: "DataType",
     onchange: "[\"Comp\",null]"
    },
   },
   {
    id: "Comp",
    title: "Component",
    component: "SelectBoxField",
    props: {
     displayExpr: "properties.id",
     collection: "->AttrDataType->DataTypeComp",
    },
   },
   {
    id: "attrType",
    title: "Attribute Type",
    component: "SelectBoxField",
    props: {
     displayExpr: "properties.id",
     collection: "AttrType",
    },
   },
   { id: "title", component: "TextBoxField" },
   { id: "description", component: "TextAreaField" },
   { id: "unique", component: "CheckBoxField" },
   { id: "required", component: "CheckBoxField" },
   { id: "disabled", component: "CheckBoxField" },  {
    id: "Prop",
    component: "TableField",
    attributes: [
     {
      id: "key",
      component: "SelectBoxField",
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
   { id: "id", component: "TextBoxField" },
   { id: "description", component: "TextAreaField" }
  ]
 },

 // TODO: Coll has only one Attr. Add validation for that.
 "Coll": {
  title: "Collection",
  id: "Coll",
  attributes: [
   { id: "id", component: "TextBoxField" },
   {
    id: "category",
    component: "SelectBoxField",
    props: {
     displayExpr: "properties.id",
     collection: "CollCategory",
    },
   },
   { id: "description", component: "TextAreaField" },
   { id: "public", component: "CheckBoxField" },
   {
    id: "Tab",
    component: "TableField",
    tab: 'Organize',
    attributes: [
     {
      id: "id",
      component: "TextBoxField"
     },
     {
      id: "name",
      component: "TextBoxField"
     }
    ]
   },
   {
    id: "Group",
    component: "TableField",
    tab: 'Organize',
    attributes: [
     {
      id: "id",
      component: "TextBoxField"
     },
     {
      id: "name",
      component: "TextBoxField"
     }
    ]
   },
     {
      id: "Role",
      component: "TableField",
      tab: "Permission",
      attributes: [
       {
        id: "role",
        component: "SelectBoxField",
        props: {
         displayExpr: "properties.id",
         collection: "Role"
        },
       },
       {
        id: "Perm",
        component: "TableField",
        attributes: [
         {
          id: "perm",
          component: "SelectBoxField",
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
    component: "TableField",
    tab: "Attribute",
    attributes: [
     {
      id: "Attr",
      title: "Attribute",
      component: "SelectBoxField",
      props: {
       displayExpr: "properties.id",
       collection: "Attr",
      },

     },
     {
      id: "tab",
      component: "SelectBoxField",
      props: {
       displayExpr: "properties.id",
       collection: "CollAttr<-CollTab",
      },
     },
     {
      id: "group",
      component: "SelectBoxField",
      props: {
       collection: "CollAttr<-CollGroup",
       displayExpr: "properties.id",
      },
     },
     {
      id: "dataType",
      component: "SelectBoxField",
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
      component: "SelectBoxField",
      props: {
       displayExpr: "properties.id",
       collection: "->CollAttrAttr->AttrDataType->DataTypeComp",
       defaultValue: "->CollAttrAttr->AttrComp:properties.id"
      },
     },
     {
      id: "title",
      component: "TextBoxField",
      props: {
       defaultValue: "->CollAttrAttr:properties.title"
      },
     },
     {
      id: "unique",
      component: "CheckBoxField",
      props: {
       defaultValue: "->CollAttrAttr:properties.unique"
      },
     },
     {
      id: "required",
      component: "CheckBoxField",
      props: {
       defaultValue: "->CollAttrAttr:properties.required"
      },
     },
     {
      id: "disabled",
      component: "CheckBoxField",
      props: {
       defaultValue: "->CollAttrAttr:properties.disabled"
      },
     },  {
      id: "Prop",
      title: "Property",
      component: "TableField",
      attributes: [
       {
        id: "key",
        component: "SelectBoxField",
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
      component: "TableField",
      attributes: [
       {
        id: "role",
        component: "SelectBoxField",
        props: {
         displayExpr: "properties.id",
         collection: "Role"
        },
       },
       {
        id: "Perm",
        component: "TableField",
        attributes: [
         {
          id: "perm",
          component: "SelectBoxField",
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
    component: "TableField",
    tab: "Child",
    attributes: [
     {
      id: "coll",
      component: "SelectBoxField",
      props: {
       displayExpr: "properties.id",
       collection: "Coll",
      },
     },
     {
      id: "id",
      component: "TextBoxField"
     },
     {
      id: "tab",
      component: "SelectBoxField",
      props: {
       displayExpr: "properties.id",
       collection: "CollChild<-CollTab",
      },
     },
     {
      id: "group",
      component: "SelectBoxField",
      props: {
       collection: "CollChild<-CollGroup",
       displayExpr: "properties.id",
      },
     },  {
      id: "Prop",
      title: "Property",
      component: "TableField",
      attributes: [
       {
        id: "key",
        component: "SelectBoxField",
        props: {
         displayExpr: "properties.key",
         collection: "Comp[TableField]->CompProp",
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
   { id: "id", component: "TextBoxField" },
   { id: "title", component: "TextBoxField" },
   { id: "description", component: "TextAreaField" },
   { id: "table", component: "CheckBoxField" },
   { id: "local", component: "CheckBoxField" },
   {
    id: "coll",
    title: "Collection",
    component: "SelectBoxField",
    props: {
     displayExpr: "properties.id",
     collection: "Coll",
     inward: true
    },
   },
   {
    id: "Attr",
    title: "Attribute",
    component: "TableField",
    tab: "Attribute",
    attributes: [
     {
      id: "Attr",
      title: "Attribute",
      component: "SelectBoxField",
      props: {
       displayExpr: "->CollAttrAttr:properties.id",
       collection: "CollForm<-FormAttr<-CollAttr"
      },
     },
     {
      id: "tab",
      component: "SelectBoxField",
      props: {
       collection: "CollForm<-FormAttr<-CollTab",
       displayExpr: "properties.id",
       defaultValue: "FormAttrAttr->CollAttrTab:properties.id"
      },
     },
     {
      id: "group",
      component: "SelectBoxField",
      props: {
       collection: "CollForm<-FormAttr<-CollGroup",
       displayExpr: "properties.id",
       defaultValue: "FormAttrAttr->CollAttrGroup:properties.id"
      },
     },
     {
      id: "dataType",
      component: "SelectBoxField",
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
      component: "SelectBoxField",
      props: {
       displayExpr: "properties.id",
       collection: "->FormAttrAttr->CollAttrAttr->AttrDataType->DataTypeComp",
       defaultValue: "FormAttrAttr->CollAttrComp:properties.id||FormAttrAttr->CollAttrAttr->AttrComp:properties.id"
      },

     },
     {
      id: "title",
      component: "TextBoxField",
      props: {
       defaultValue: "->FormAttrAttr:properties.title||FormAttrAttr->CollAttrAttr:properties.title"
      }
     },
     {
      id: "required",
      component: "CheckBoxField",
      props: {
       defaultValue: "->FormAttrAttr:properties.required||FormAttrAttr->CollAttrAttr:properties.required"
      }
     },
     {
      id: "disabled",
      component: "CheckBoxField",
      props: {
       defaultValue: "->FormAttrAttr:properties.disabled||FormAttrAttr->CollAttrAttr:properties.disabled"
      }
     },  {
      id: "Prop",
      title: "Property",
      component: "TableField",
      attributes: [
       {
        id: "key",
        component: "SelectBoxField",
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
    component: "TableField",
    tab: "Children",
    attributes: [
     {
      id: "Coll",
      title: "Collection",
      component: "SelectBoxField",
      props: {
       displayExpr: "->CollChildColl:properties.id",
       collection: "CollForm<-FormChild<-CollChild",
       // displayExpr: "id",
       // collection: "CollForm<-FormChild"
      },

     },
     {
      id: "tab",
      component: "SelectBoxField",
      props: {
       collection: "CollForm<-FormChild<-CollTab",
       displayExpr: "properties.id",
       defaultValue: "FormChildColl->CollChildTab:properties.id"
      },
     },
     {
      id: "group",
      component: "SelectBoxField",
      props: {
       collection: "CollForm<-FormChild<-CollGroup",
       displayExpr: "properties.id",
       defaultValue: "FormChildColl->CollChildGroup:properties.id"
      },
     },
     {
      id: "Attr",
      title: "Attribute",
      component: "TableField",
      attributes: [
       {
        id: "Attr",
        title: "Attribute",
        component: "SelectBoxField",
        props: {
         displayExpr: "->CollAttrAttr:properties.id",
         collection: "FormChildAttr<-FormChildColl->CollChildColl->CollAttr"
        },

       },
       {
        id: "dataType",
        component: "SelectBoxField",
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
        component: "SelectBoxField",
        props: {
         displayExpr: "properties.id",
         collection: "->FormChildAttrAttr->CollAttrAttr->AttrDataType->DataTypeComp",
         defaultValue: "FormChildAttrAttr->CollAttrComp:properties.id||FormChildAttrAttr->CollAttrAttr->AttrComp:properties.id"
        },
       },
       {
        id: "title",
        component: "TextBoxField",
        props: {
         defaultValue: "->FormChildAttrAttr:properties.title||FormChildAttrAttr->CollAttrAttr:properties.title"
        }
       },
       {
        id: "required",
        component: "CheckBoxField",
        props: {
         defaultValue: "->FormChildAttrAttr:properties.required||FormChildAttrAttr->CollAttrAttr:properties.required"
        }
       },
       {
        id: "disabled",
        component: "CheckBoxField",
        props: {
         defaultValue: "->FormChildAttrAttr:properties.disabled||FormChildAttrAttr->CollAttrAttr:properties.disabled"
        }
       },
       {
        id: "child",
        component: "SelectBoxField",
        props: {
         displayExpr: "properties.id",
         collection: "Form"
        },
       },
       {
        id: "Prop",
        component: "TableField",
        attributes: [
         {
          id: "key",
          component: "SelectBoxField",
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
    { id: "id", component: "TextBoxField" },
    {
     id: "role",
     component: "TagBoxField",
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
    { id: "id", component: "TextBoxField" },
   ]
  },
 "Role":
  {
   title: "Role",
   id: "Role",
   attributes: [
    { id: "id", component: "TextBoxField" },
   ]
  },
 "SimpleImport":
  {
   title: "Simple Insert",
   id: "SimpleImport",
   local: true,
   attributes: [
    { id: "csv", component: "TextAreaField", props: {width: 600, height: 500} },
    { id: "label", component: "TextBoxField" },
    { id: "dry", component: "CheckBoxField" },
    { id: "lookup", component: "TextBoxField" },
    { id: "lookupId", component: "TextBoxField" },
    {
     id: "Meta",
     component: "TableField",
     attributes: [
      { id: "column", component: "TextBoxField" },
      { id: "attr", title:"Mapping Attribute", component: "SelectBoxField", props: {
        displayExpr: "key",
        collection: "Attr",
       } },
      // {
      //  id: "column",
      //  component: "SelectBoxField",
      //  props: {
      //   displayExpr: "key",
      //   collection: "Update Dynamically on meta based on first row",
      //  },
      // },
      { id: "attrId", title:"Attribute ID", component: "TextBoxField" },
      { id: "coll", title:"Lookup Collection", component: "SelectBoxField", props: {
        displayExpr: "key",
        collection: "Coll",
       } },
      { id: "collLabel",title:"Lookup Label", component: "TextBoxField" },
      { id: "inward", component: "CheckBoxField" },
      { id: "collId", title:"Lookup Collection ID", component: "TextBoxField" },
      { id: "edge", title:"Edge Type", component: "TextBoxField" },
      { id: "func", title:"Function", component: "SelectBoxField",
       props: {
        stringValue: true,
        displayExpr: "key",
        collection: '[{"key":"dataType","id":"dataType"}, {"id": "lookup", "key": "lookup"}]',
       }
      },
      { id: "skip", component: "CheckBoxField" },
     ]
    }
   ]
  },
 "SignUp": {
  title: "User",
  id: "User",
  local: true,
  attributes: [
   { id: "email", component: "TextBoxField" },
   { id: "password", component: "TextBoxField", props: {mode: 'password'} },
  ]
 },
 "LogIn": {
  title: "User",
  id: "User",
  local: true,
  attributes: [
   { id: "email", component: "TextBoxField" },
   { id: "password", component: "TextBoxField", props: {mode: 'password'} },
  ]
 },
// TODO: Dynamic Filter on Grid: Role->Filter
};

// window.a = AttrsTableData;
