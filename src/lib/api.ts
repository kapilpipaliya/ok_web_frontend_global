import {findVertexByLabelAndUniqueIdWithSkip} from "./Vertex";
import {AttrsAdminTableData} from "./apiAdmin";
import {FieldAttribute, FormMetaData} from "./Type";
import {IFormContext} from "./Utils";
import {useContext} from "solid-js";
import {GraphContext} from "./graph";
/* use in c++
export const JSONToCypherMap = (json: object) => {
  // https://stackoverflow.com/questions/20841571/how-to-solve-the-dilemma-while-handle-json-in-neo4j-cypher
  return jju.stringify(json, { quote: "'" }).replace(/"/g, "\\x22");
};
*/

export const API_BASE_URL = 'https://easyformforge.com/api';

const collectionAttr = [
  {
    name: "displayName",
    component: "TextBox",
    props: {
      onchange: '{"new": ["name","id"], "edit": ["name","id"]}',
    }
  },
  {
    name: "name",
    displayName: "ID",
    component: "TextBox",
    props: {},
  },
  {
    name: "definition",
    component: "TextArea",
  },
  {
    name: "dataType",
    component: "SelectBox",
    props: {

      collection: "g:'DataType'",
    },
  },
  {
    name: "Comp",
    component: "SelectBox",
    props: {

      collection: "->$0DataType->$0Comp",
      // smaller version:
      // collection: "g:'Comp'",
    },
  },
  {
    name: "coll",
    component: "SelectBox",
    props: {
      collection: "g:'Coll'",
    },
  },
  {
    name: "required",
    component: "CheckBox",
  },
  {
    name: "disabled",
    component: "CheckBox",
  },
  {
    name: "Prop",
    displayName: "Properties",
    component: "Table2",
    attributes: [
      {
        name: "name",
        component: "SelectBox",
        props: {
          displayExpr: "::'P.name'",
          collection: "<-$0->$0Comp->$0Prop",
        },
      },
      {
        name: "value",
        meta: "->$0Name->$0Comp<-CompChild->$0Prop++->$0Name->$0Comp->$0Prop++->$0Name->$0ValueProp",
        component:
         "->$0Name->$0Comp<-CompChild::'P.name'||->$0Name->$0Comp::'P.name'||->$0Name->$0DataType->$0Default::'P.name'",
      },
    ],
  },
  {
    name: "Role",
    displayName: "Permissions",
    component: "Table2",
    attributes: [
      {
        name: "role",
        component: "SelectBox",
        props: {

          collection: "g:'Role'",
        },
      },
      {
        name: "Perm",
        component: "Table2",
        attributes: [
          {
            name: "perm",
            component: "TagBox",
            props: {

              collection: "g:'Perm'",
            },
          },
          {
            name: "scope",
            component: "TextBox",
          },
        ],
      }
    ],
  },
  {
    name: "Attr",
    component: "Table2",
    tab: "expand",
    props: {
      type: 'Attr',
      label: "Attr",
    },
  }
] as FieldAttribute[];
let childAttrs: FieldAttribute = collectionAttr[collectionAttr.length - 1];
for (let i = 0; i <5; i++) {
  const attributes =  JSON.parse(JSON.stringify(collectionAttr));
  childAttrs.attributes =  attributes;
  childAttrs = attributes[attributes.length - 1];
}


const pageAttr = [
  {
    name: "coll",
    displayName: "Collection",
    component: "SelectBox",
    props: {
      collection: "g:'Coll'",
      parentLabel: "Coll",
    },
  },
  {
    name: "Att",
    displayName: "Attribute",
    component: "SelectBox",
    props: {
      // displayExpr: "P.displayName||P.name",
      displayExpr: "$P.displayName ($P.name)",
      collection: "->$0Coll->Attr||-$0->$0Coll->Attr",
    },
  },
  {
    name: "name",
    displayName: "ID",
    component: "TextBox",
    // props: {},
  },
  // {
  //   name: "definition",
  //   component: "TextArea",
  // },
  // {
  //   name: "parent",
  //   component: "SelectBox",
  //   props: {
  //
  //     collection: "<-$0->Attr",
  //     focusRefresh: true
  //   },
  // },
  {
    name: "data",
    component: "SelectBox",
    props: {
      collection: `g:'{{->$0Coll::'P.name'}}'`,
    },
  },
  {
    name: "Comp",
    component: "SelectBox",
    props: {

      collection: "g:'Comp'",
      // smaller version:
      // collection: "g:'Comp'",
    },
  },
  {
    name: "Prop",
    displayName: "Property",
    component: "Table2",
    attributes: [
      {
        name: "name",
        component: "SelectBox",
        props: {
          displayExpr: "::'P.name'",
          collection: "<-$0->$0Comp->$0Prop",
        },
      },
      {
        name: "value",
        meta: "->$0Name->$0Comp<-CompChild->$0Prop++->$0Name->$0Comp->$0Prop++->$0Name->$0ValueProp",
        component:
            "->$0Name->$0Comp<-CompChild::'P.name'||->$0Name->$0Comp::'P.name'||->$0Name->$0DataType->$0Default::'P.name'",
      },
    ],
  },
  {
    name: "Role",
    component: "Table2",
    attributes: [
      {
        name: "role",
        component: "SelectBox",
        props: {

          collection: "g:'Role'",
        },
      },
      {
        name: "Perm",
        component: "Table2",
        attributes: [
          {
            name: "perm",
            component: "SelectBox",
            props: {

              collection: "g:'Perm'",
            },
          },
        ],
      },
    ],
  },
  {
    name: "Attr",
    component: "Table2",
    tab: "expand",
    props: {
      type: 'Attr',
      label: "Attr",
    },
  },
] as FieldAttribute[];
let pageChildAttrs: FieldAttribute = pageAttr[pageAttr.length - 1];
// Keep max level 10, else the Page navigation is very slow. because revert transaction on record takes so much time.
for (let i = 0; i <10; i++) {
  const attributes =  JSON.parse(JSON.stringify(pageAttr));
  pageChildAttrs.attributes =  attributes;
  pageChildAttrs = attributes[attributes.length - 1];
}
export const AdminAttrKeys = ["User", "Perm", "Role", "Dashboard", "Import", "Nav"];
export const AttrsTableData: { [key: string]: FormMetaData } = {
  DataType: {
    title: "DataType",
    name: "DataType",
    isInlineEditable: true,
    attributes: [
      { name: "name", component: "TextBox" },
      {
        name: "default",
        displayName: "Default Component",
        component: "SelectBox",
        props: {

          collection: "g:'Comp'",
        },
      },
    ],
  },
  CompCategory: {
    title: "Component Category",
    name: "CompCategory",
    isInlineEditable: true,
    attributes: [
      { name: "name", component: "TextBox" },
      { name: "description", component: "TextArea" },
    ],
  },
  Comp: {
    title: "Component",
    name: "Comp",
    isInlineEditable: false,
    attributes: [
      {
        name: "category",
        component: "SelectBox",
        props: {

          collection: "g:'CompCategory'",
          parentLabel: "CompCategory",
          inward: true,
        },
      },
      { name: "name", component: "TextBox" },
      {
        name: "parent",
        displayName: "Parent Component",
        component: "SelectBox",
        props: {

          collection: "g:'Comp'",
          inward: true,
          parentLabel: "Comp",
          childLabel: "Child",
        },
      },
      {
        name: "dataType",
        displayName: "DataType",
        component: "TagBox",
        props: {

          collection: "g:'DataType'",
          inward: true,
          parentLabel: "DataType",
        },
      },
      {
        name: "child",
        displayName: "Children",
        component: "CheckBox",
      },
      {
        name: "required",
        displayName: "Required",
        component: "CheckBox",
      },
      { name: "description", component: "TextArea" },
     // TODO: add validation, duplicate row with same name is not allowed.
      {
        name: "Prop",
        component: "Table2",
        tab: "Properties",
        attributes: [
          {
            name: "name",
            component: "TextBox",
          },
          {
            name: "need",
            component: "CheckBox",
          },
          {
            name: "required",
            component: "CheckBox",
          },
          {
            name: "dataType",
            component: "SelectBox",
            props: {

              collection: "g:'DataType'",
              onchange: '["Comp",null]',
            },
          },
          {
            name: "Comp",
            displayName: "Component",
            component: "SelectBox",
            props: {

              collection: "->$0DataType->$0Comp",
            },
          },
          // {
          //   // TODO: Be sure the name is ok, it will not change in production.
          //   name: "valueProp",
          //   displayName: "Value Property",
          //   component: "Table2",
          //   tab: "Properties",
          //   attributes: [
          //     {
          //       name: "name",
          //       component: "SelectBox",
          //       props: {
          //         displayExpr: "::'P.name'",
          //         collection: "<-$0->$0Comp->$0Prop",
          //       },
          //     },
          //     {
          //       name: "value",
          //       meta: "->$0Name->$0Comp<-CompChild->$0Prop++->$0Name->$0Comp->$0Prop",
          //       component: "->$0Name->$0Comp<-CompChild::'P.name'||->$0Name->$0Comp::'P[IdAttr]'",
          //     },
          //   ],
          // },
          {
            name: "value",
            meta: "->$0Comp<-CompChild->$0Prop++->$0Comp->$0Prop++->$0ValueProp",
            component:
              "->$0Comp<-CompChild::'P.name'||->$0Comp::'P.name'||->$0DataType->$0Default::'P.name'",
            // component: "->$0Comp<-CompChild::'P.name'||->$0Comp::'P.name'||->$0DataType->$0Default::'P.name'||defaultComp|->$0DataType::'P.name'",
          },
          {
            name: "description",
            component: "TextArea",
            props: {
              // autoResizeEnabled: true,
              width: "550px",
            },
          },
          {
            name: "reset",
            component: "Button",
            props: {
              children: "Reset",
              class: "border-color:#FF0000 color:#FF0000",
              variant: 'outlined',
              // TODO:
              // function: "reset",
              // onchange: '{"new": ["value","clear"], "edit": ["value","clear"]}',
            },
          },
        ],
      },
      {
        name: "Event",
        component: "Table2",
        tab: "Events",
        attributes: [
          {
            name: "name",
            component: "TextBox",
          },
          {
            name: "description",
            component: "TextArea",
            props: {
              // autoResizeEnabled: true,
              width: "550px",
            },
          },
        ],
      },
    ],
  },
  CollCategory: {
    title: "Collection Category",
    name: "CollCategory",
    isInlineEditable: true,
    attributes: [
      { name: "name", component: "TextBox" },
      { name: "description", component: "TextArea" },
    ],
  },
  // TODO: Coll has only one Attr. Add validation for that.
  Coll: {
    title: "Collection",
    name: "Coll",
    attributes: [
      {
        name: "title",
        component: "TextBox",
        props: {
          onchange: '{"new": ["name","id"]}',
        },
      },
      {
        name: "name",
        component: "TextBox",
        props: {
          validationRules: [
            {
              type: "required",
              message: "ID is required",
            },
            {
              type: "custom",
              ignoreEmptyValue: true,
              message: "This ID is already taken",
              validationCallback: (options: any) => {
                const { record } = options.validator.context || {} as IFormContext;
                const [graph, setGraph] = useContext(GraphContext)!;
                const val = options.value;
                if (Object.keys(AttrsTableData).includes(val) || Object.keys(AttrsAdminTableData).includes(val)) {
                  return false;
                } else {
                  return !findVertexByLabelAndUniqueIdWithSkip("Coll", "id", val, record.vertex.id,graph);
                }
              },
            },
            // , {
            //   type: 'email',
            //   message: 'Email is invalid',
            // }
          ],
        },
      },
      {
        name: "category",
        component: "SelectBox",
        props: {

          collection: "g:'CollCategory'",
          parentLabel: "CollCategory",
          inward: true,
        },
      },
      {
        name: "dashboard",
        component: "TagBox",
        props: {

          collection: "g:'Dashboard'",
          parentLabel: "Dashboard",
          inward: true,
        },
      },
      { name: "description", component: "TextArea" },
      { name: "public", component: "CheckBox" },
      { name: "isInlineEditable", component: "CheckBox", },
      // { name: "supportCustomFields", component: "CheckBox" },
      // { name: "searchOnly", component: "CheckBox" },
      // { name: "supportDeletedRecordSearch", component: "CheckBox" },
      {
        name: "pk",
        displayName: "Primary Key",
        component: "TagBox",
        props: {

          collection: "->Attr",
          // TODO: add validation
          // If there is not name attribute,
          // then this field is required.
        },
      },
      {
        name: "nameKey",
        component: "TagBox",
        props: {

          collection: "->Attr",
          // TODO: add validation
          // If there is not name attribute,
          // then this field is required.
        },
      },

      {
        name: "Attr",
        component: "Table2",
        tab: "Attribute",
        props: {
          type: 'Attr',
          label: "Attr",
        },
        attributes: collectionAttr,
      },
      {
        name: "Rules",
        component: "Table2",
        tab: "Rules",
        props: {
          type: 'Rules',
          label: "Rules",
        },
        attributes: [
          {
            name: "name",
            component: "TextBox",
            props: {},
          },
          {
            name: "Rule",
            component: "Table2",
            tab: "Rule",
            props: {
              type: 'Rule',
              label: "Rule",
            },
            attributes: [
              {
                name: "cond",
                displayName: "Conditions",
                component: "Table2",
                attributes: [
                  {
                    name: "left",
                    displayName: "Paren",
                    component: "SelectBox",
                    props: {
                      items: `(
((
(((`,
                    },
                  },{
                    name: "layout",
                    displayName: "Layout",
                    component: "DropDownBoxTreeView",
                    props: {
                      // collection: "g:'DataType'",
                    },
                  },{
                    name: "field",
                    displayName: "Field",
                    component: "SelectBox",
                    props: {
                      // collection: "g:'DataType'",
                    },
                  },
                  {
                    name: "operator",
                    displayName: "Operator",
                    component: "SelectBox",
                    props: {
                      items: `<
<=
>=`,
                    },
                  },
                  {
                    name: "right",
                    displayName: "Paren",
                    component: "SelectBox",
                    props: {
                      items: `)
))
)))`,
                    },
                  }
                ]
              },
              {
                name: "dataType",
                displayName: "DataType",
                component: "SelectBox",
                props: {
                  collection: "g:'DataType'",
                },
              },
              {
                name: "comp",
                displayName: "Component",
                component: "SelectBox",
                props: {
                  collection: "->$0DataType->$0Comp||Comp",
                },
              },
              {
                name: "value",
                displayName: "Value",
                meta: "->$0Comp<-CompChild->$0Prop++->$0Comp->$0Prop++->$0ValueProp",
                component:
                 `->$0Comp<-CompChild::'P.name'||->$0Comp::'P.name'||->$0DataType->$0Default::'P.name'`,
              }
            ]
          }
        ],
      },

/*      {
        name: "Child",
        component: "Table2",
        tab: "Child",
        attributes: [
          {
            name: "coll",
            component: "SelectBox",
            props: {

              collection: "g:'Coll'",
            },
          },
          {
            name: "displayName",
            component: "TextBox",
            props: {
              onchange: '{"new": ["name","id"], "edit": ["name","id"]}',
            }
          },
          {
            name: "name",
            component: "TextBox",
          },
          {
            name: "tab",
            component: "SelectBox",
            props: {

              collection: "-CollChild->$0Tab",
            },
          },
          {
            name: "group",
            component: "SelectBox",
            props: {
              collection: "-CollChild->$0Group",

            },
          },
          {
            name: "Prop",
            displayName: "Property",
            component: "Table2",
            attributes: [
              {
                name: "name",
                component: "SelectBox",
                props: {
                  displayExpr: "::'P.name'",
                  collection: "g:'Comp[Table]'->$0Prop",
                },
              },
              {
                name: "value",
                meta: "->$0Name->$0Comp<-CompChild->$0Prop++->$0Name->$0Comp->$0Prop++->$0Name->$0ValueProp",
                component: "->$0Name->$0Comp<-CompChild::'P.name'||->$0Name->$0Comp::'P.name'",
              },
            ],
          },
        ],
      },*/
      {
        name: "Transform",
        component: "Table2",
        tab: "Transform",
        attributes: [
          {
            name: "coll",
            component: "SelectBox",
            props: {

              collection: "g:'Coll'",
            },
          },
          {
            name: "displayName",
            component: "TextBox",
          },
          {
            name: "fieldDefaults",
            component: "TextBox",
          },
          {
            name: "Prop",
            displayName: "Property",
            component: "Table2",
            attributes: [
              {
                name: "name",
                component: "SelectBox",
                props: {
                  displayExpr: "::'P.name'",
                  collection: "g:'Comp[Table]'->$0Prop",
                },
              },
              {
                name: "value",
                meta: "->$0Name->$0Comp<-CompChild->$0Prop++->$0Name->$0Comp->$0Prop++->$0Name->$0ValueProp",
                component: "->$0Name->$0Comp<-CompChild::'P.name'||->$0Name->$0Comp::'P.name'",
              },
            ],
          },
        ],
      },
      {
        name: "Role",
        component: "Table2",
        tab: "Permission",
        attributes: [
          {
            name: "role",
            component: "SelectBox",
            props: {

              collection: "g:'Role'",
            },
          },
          {
            name: "perm",
            component: "TagBox",
            props: {
              collection: "g:'Perm'",
            },
          },
          {
            name: "scope",
            component: "TextBox",
          },
        ],
      },
      {
        name: "uniqueConstrain",
        component: "Table2",
        tab: "Unique Constrain",
        attributes: [
          {
            name: "pk",
            displayName: "Unique Constrain Keys",
            component: "TagBox",
            props: {
              collection: "<-$0->Attr",
            },
          },
        ],
      },
    ],
  },
  SignUp: {
    title: "User",
    name: "User",
    isRealTime: true,
    attributes: [
      { name: "email", component: "TextBox" },
      {
        name: "pass",
        component: "TextBox",
        props: { mode: "password" },
      },
    ],
  },
  LogIn: {
    title: "User",
    name: "User",
    isRealTime: true,
    attributes: [
      { name: "email", component: "TextBox" },
      {
        name: "pass",
        component: "TextBox",
        props: { mode: "password" },
      },
    ],
  },
  Page: {
    title: "Page",
    name: "Page",
    attributes: [
      {
        name: "title",
        component: "TextBox",
        props: {
          onchange: '{"new": ["name","id"]}',
        },
      },
      {
        name: "name",
        component: "TextBox",
        props: {
          validationRules: [
            {
              type: "required",
              message: "ID is required",
            },
            {
              type: "custom",
              ignoreEmptyValue: true,
              message: "This ID is already taken",
              validationCallback: (options: any) => {
                const { record } = options.validator.context || {} as IFormContext;
                const [graph, setGraph] = useContext(GraphContext)!;
                const val = options.value;
                return !findVertexByLabelAndUniqueIdWithSkip("Page", "id", val, record.vertex.id,graph);
              },
            },
          ],
        },
      },
      { name: "description", component: "TextArea" },
      {
        name: "dashboard",
        component: "TagBox",
        props: {

          collection: "g:'Dashboard'",
          parentLabel: "Dashboard",
          inward: true,
        },
      },
      { name: "public", component: "CheckBox" },
      { name: "isRealTime", component: "CheckBox" },
      {
        name: "coll",
        displayName: "Collection",
        component: "SelectBox",
        props: {
          collection: "g:'Coll'",
          // inward: true,
          parentLabel: "Coll",
        },
      },
      {
        name: "data",
        component: "SelectBox",
        props: {
          collection: `g:'{{->$0Coll::'P.name'}}'`,
        },
      },
      {
        name: "Attr",
        component: "Table2",
        tab: "Attribute",
        props: {
          type: 'Attr',
          label: "Attr",
        },
        attributes: pageAttr,
      },
      {
        name: "Role",
        component: "Table2",
        tab: "Permission",
        attributes: [
          {
            name: "role",
            component: "SelectBox",
            props: {

              collection: "g:'Role'",
            },
          },
          {
            name: "Perm",
            component: "Table2",
            attributes: [
              {
                name: "perm",
                component: "SelectBox",
                props: {

                  collection: "g:'Perm'",
                },
              },
            ],
          },
        ],
      },
    ],
  },
};
