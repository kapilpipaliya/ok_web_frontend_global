import { batch, createContext, onCleanup } from "solid-js";
import { ServerEventsDispatcher } from "../utils/ws_events_dispatcher";
import { addNewEdge, deleteEdge, newEdge } from "./Edge";
import { addNewVertex, deleteVertex, findVertexByLabelAndUniqueIdWithSkip, mergeVertexProperties, newVertex, replaceVertexProperties } from "./Vertex";
import { Vertex, getNewTxnId, commitTxn, graph, IdAttr, getNewGraphId, revertTransaction, setGraph, Id } from "./graph";
import { evaluate } from "./jsep";
import jsep from "jsep";
import { klona } from "klona/json";
import { setSelectionValue } from "../components/input/SelectionUtils";
import { getToEdge } from "./CommonUtils/getToEdge";

export function replaceExpressionToLabel(collection: string, vertex: Vertex) {
  if (!collection) return "";
  // example: `{->$0Coll::'P.${IdAttr}'}` will get a collection from expression
  if (collection.includes("{{") && collection.includes("}}")) {
    collection = collection.replace(
      /{{.*}}/,
      getSelectionOptions([vertex], collection.match(/{{(.*)}}/)![1]! || "")
        .vertexes || ""
    );
  }
  return collection;
}
export const AdminAttrKeys = [
  "User",
  "Perm",
  "Role",
  "Dashboard",
  "Import",
  "Nav",
];
export function getSelectionOptions(
  vertex: Vertex[],
  collection: string,
  strict?: boolean
): { error: boolean; vertexes?: any } {
  collection = replaceExpressionToLabel(collection, vertex[0]);
  try {
    const value = evaluate(jsep(collection), { vertexes: vertex });
    if (value) {
      return { error: false, vertexes: value };
    } else {
      return { error: true };
    }
  } catch (e) {
    console.error(e, vertex, collection);
    return { error: true };
  }
}
const collectionAttr = [
  {
    name: "displayName",
    component: "TextBox",
    props: {
      onchange: '{"new": ["name","id"], "edit": ["name","id"]}',
    },
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
      },
    ],
  },
  {
    name: "Attr",
    component: "Table2",
    tab: "expand",
    props: {
      type: "Attr",
      label: "Attr",
    },
  },
] as FieldAttribute[];
let childAttrs: FieldAttribute = collectionAttr[collectionAttr.length - 1];
for (let i = 0; i < 5; i++) {
  const attributes = JSON.parse(JSON.stringify(collectionAttr));
  childAttrs.attributes = attributes;
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
      type: "Attr",
      label: "Attr",
    },
  },
] as FieldAttribute[];
let pageChildAttrs: FieldAttribute = pageAttr[pageAttr.length - 1];
// Keep max level 10, else the page navigation is very slow. because revert transaction on record takes so much time.
for (let i = 0; i < 10; i++) {
  const attributes = JSON.parse(JSON.stringify(pageAttr));
  pageChildAttrs.attributes = attributes;
  pageChildAttrs = attributes[attributes.length - 1];
}


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
              style: {"color": "rgb(252,0,0)","border":"1px solid rgb(252,0,0)"},
              variant: "custom",
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
              validationCallback: (options) => {
                const { record } =
                  options.validator.context || ({} as IFormContext);

                const val = options.value;
                if (
                  Object.keys(AttrsTableData).includes(val) ||
                  Object.keys(AttrsAdminTableData).includes(val)
                ) {
                  return false;
                } else {
                  return !findVertexByLabelAndUniqueIdWithSkip(
                    "Coll",
                    "id",
                    val,
                    record.vertex.id
                  );
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
      { name: "isInlineEditable", component: "CheckBox" },
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
          type: "Attr",
          label: "Attr",
        },
        attributes: collectionAttr,
      },
      {
        name: "Rules",
        component: "Table2",
        tab: "Rules",
        props: {
          type: "Rules",
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
              type: "Rule",
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
                  },
                  {
                    name: "layout",
                    displayName: "Layout",
                    component: "DropDownBoxTreeView",
                    props: {
                      // collection: "g:'DataType'",
                    },
                  },
                  {
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
                  },
                ],
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
                component: `->$0Comp<-CompChild::'P.name'||->$0Comp::'P.name'||->$0DataType->$0Default::'P.name'`,
              },
            ],
          },
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
                component:
                  "->$0Name->$0Comp<-CompChild::'P.name'||->$0Name->$0Comp::'P.name'",
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
              validationCallback: (options) => {
                const { record } =
                  options.validator.context || ({} as IFormContext);

                const val = options.value;
                return !findVertexByLabelAndUniqueIdWithSkip(
                  "Page",
                  "id",
                  val,
                  record.vertex.id
                );
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
          type: "Attr",
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
export function deleteRow(
  vertex: Vertex,
  isRealTime: boolean,
  txnId: number,
  Ws: ServerEventsDispatcher
) {
  batch(() => {
    if (isRealTime) {
      txnId = getNewTxnId();
    }
    // delete all vertex in edges
    const inEdges = vertex.IN;
    for (const type in inEdges) {
      for (const edgeId of inEdges[type]) {
        const deleteEdgeResult = deleteEdge(txnId, edgeId);
        if (deleteEdgeResult?.error) alert(deleteEdgeResult.error);
      }
    }
    // delete all outEdges of vertex
    const outEdge = vertex.OUT;
    for (const type in outEdge) {
      for (const edgeId of outEdge[type]) {
        const deleteEdgeResult = deleteEdge(txnId, edgeId);
        if (deleteEdgeResult?.error) alert(deleteEdgeResult.error);
      }
    }

    // delete vertex:
    const deleteResult = deleteVertex(txnId, vertex.id);
    if (deleteResult.error) alert(deleteResult.error);
    if (isRealTime) commitTxn(txnId, Ws);
  });
}export function getChildVertex(path: string[], currentVertex: Vertex): { error: boolean; vertex?: Vertex; } {
  if (path.length === 0)
    return {
      error: true,
    };

  let type = path[0];
  let filter = "";

  const filterIndex = type.indexOf("[");
  if (filterIndex > -1) {
    filter = type.slice(filterIndex);
    // modify the variable itself
    type = type.slice(0, filterIndex);
  }
  if (type.includes("$0")) {
    if (!currentVertex.L) return {
      error: true,
    };
    type = type.replace("$0", currentVertex.L[0]);
  }
  let vertexes = (currentVertex.OUT[type] || []).map((edgeId) => graph.vertexes[graph.edges[edgeId].E]);

  if (filter) {
    // TODO:
    // vertexes = vertexes.filter(x=>x.P[IdAttr] === 'component')
  }
  if (vertexes.length != 1) {
    return {
      error: true,
    };
  } else {
    const newVertex = vertexes[0];
    if (newVertex) {
      if (path.length > 1) {
        return getChildVertex(path.slice(1), newVertex);
      } else {
        return {
          error: false,
          vertex: newVertex,
        };
      }
    } else {
      return {
        error: true,
      };
    }
  }
}
export function getParentVertex(path: string[], currentVertex: Vertex): { error: boolean; vertex?: Vertex } {
  const type = path[path.length - 1].replace("$0", currentVertex.L[0]);
  const edges = currentVertex.IN[type];
  if (!edges || (edges && edges.length != 1)) {
    return {
      error: true,
    };
  } else {
    const edge = graph.edges[edges[0]];
    if (edge) {
      const newVertex = graph.vertexes[edge.S];
      if (newVertex) {
        if (path.length > 1) {
          return getParentVertex(path.slice(0, -1), newVertex);
        } else {
          return {
            error: false,
            vertex: newVertex,
          };
        }
      } else {
        return {
          error: true,
        };
      }
    } else {
      return {
        error: true,
      };
    }
  }
}
export function getChildVertexes(
  path: string[],
  currentVertexes: Vertex[],
  strict?: boolean
): { error: boolean; vertexes?: Vertex[]; } {
  const stepVertexes = new Map<number, Vertex>();
  if (path.length == 0) {
    return { error: true };
  }
  let type = path[0];
  for (const currentVertex of currentVertexes) {
    if (type.includes("$0")) {
      if (!currentVertex.L) continue;
      type = type.replace("$0", currentVertex.L[0]);
    }
    const edgeIds = currentVertex.OUT?.[type] || [];
    if (edgeIds.length == 0) {
      // we only return error if its in middle of path
      if (strict && path.length > 1) {
        return {
          error: true,
        };
      } else {
        continue;
      }
    }

    for (const edgeId of edgeIds) {
      const edge = graph.edges[edgeId];
      if (edge) {
        const newVertex = graph.vertexes[edge.E];
        if (newVertex) {
          stepVertexes.set(newVertex.id, newVertex);
        } else {
          return {
            error: true,
          };
        }
      } else {
        return {
          error: true,
        };
      }
    }
  }

  if (path.length > 1) {
    return getChildVertexes(path.slice(1), Array.from(stepVertexes.values()), strict);
  } else {
    return {
      error: false,
      vertexes: Array.from(stepVertexes.values()),
    };
  }
}
export function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
// This method read all property vertexes and make an object.
export const getProps = (meta: Vertex) => (getChildVertexes(["$0Prop"], [meta]).vertexes || []).reduce((acc, curr) => {
  const key = getSelectionOptions([curr], "T:(->$0Key::'P.key')").vertexes;
  if (key) {
    acc[key] = curr.P.value;
  }
  return acc;
}, {} as { [key: string]: any; });

export function getValueFromVertexOrKey(obj: { [key: string]: Vertex; } | any, key: string) {
  return obj?.[key];
  // return obj[key]?.id ? obj[key].P.value : obj[key];
}
export function isObject(i: any) {
  if (i && !Array.isArray(i)) {
    return "object" == typeof i;
  } else {
    return !1;
  }
}

export function groupBy(xs: { [key: string]: any; }[], groupFn: (record: { [key: string]: any; }) => string) {
  return xs.reduce((acc, element) => {
    const key = groupFn(element);
    const value = acc[key];
    if (value !== void 0) {
      value.push(element);
    } else {
      acc[key] = [element];
    }
    return acc;
  }, {});
}
export const AttrsAdminTableData: { [key: string]: FormMetaData; } = {
  User: {
    title: "User",
    name: "User",
    isInlineEditable: true,
    attributes: [
      { name: "name", component: "TextBox" },
      { name: "email", component: "TextBox" },
      { name: "pass", component: "TextBox" },
      {
        name: "role",
        component: "TagBox",
        props: {
          collection: "g:'Role'",
        },
      },
    ],
  },
  Perm: {
    title: "Perm",
    name: "Perm",
    isInlineEditable: true,
    attributes: [{ name: "name", component: "TextBox" }],
  },
  Role: {
    title: "Role",
    name: "Role",
    isInlineEditable: true,
    attributes: [{ name: "name", component: "TextBox" }],
  },
  Dashboard: {
    title: "Dashboards",
    name: "Dashboard",
    isInlineEditable: true,
    attributes: [
      { name: "name", component: "TextBox" },
      { name: "description", component: "TextArea" },
    ],
  },
  Import: {
    title: "Simple Insert",
    name: "Import",
    isRealTime: true,
    attributes: [
      {
        name: "csv",
        component: "TextArea",
        props: { width: 600, height: 500 },
      },
      { name: "label", component: "TextBox" },
      { name: "dry", component: "CheckBox" },
      { name: "lookup", component: "TextBox" },
      { name: "lookupId", component: "TextBox" },
      { name: "lookupChild", component: "TextBox" },
      {
        name: "meta",
        component: "Table2",
        attributes: [
          { name: "column", component: "TextBox" },
          // {
          //  name: "column",
          //  component: "SelectBox",
          //  props: {
          //   displayExpr: "key",
          //   collection: "Update Dynamically on meta based on first row",
          //  },
          // },
          { name: "attrId", displayName: "Attribute ID", component: "TextBox" },
          {
            name: "coll",
            displayName: "Lookup Collection",
            component: "SelectBox",
            props: {
              displayExpr: "name",
              collection: "g:'Coll'",
            },
          },
          { name: "collLabel", displayName: "Lookup Label", component: "TextBox" },
          { name: "inward", component: "CheckBox" },
          {
            name: "collId",
            displayName: "Lookup Collection ID",
            component: "TextBox",
          },
          { name: "edge", displayName: "Edge Type", component: "TextBox" },
          {
            name: "func",
            displayName: "Function",
            component: "SelectBox",
            props: {
              stringValue: true,
              displayExpr: "key",
              collection: '[{"key":"dataType","id":"dataType"}, {"id": "lookup", "key": "lookup"}]',
            },
          },
          { name: "skip", component: "CheckBox" },
          { name: "skipRow", component: "TextArea" },
        ],
      },
    ],
  },
  Nav: {
    title: "Navigation",
    name: "Nav",
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
              validationCallback: (options) => {
                const { record } = options.validator.context || {} as IFormContext;

                const val = options.value;
                return !findVertexByLabelAndUniqueIdWithSkip("Navigation", "id", val, record.vertex.id);
              },
            },
          ],
        },
      },
      { name: "description", component: "TextArea" },
      {
        name: "Attr",
        component: "Table2",
        tab: "Attributes",
        props: {
          type: "NavAttr"
        },
        attributes: [
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
            name: "expanded",
            component: "CheckBox",
          },
          {
            name: "func",
            component: "SelectBox",
            props: {
              items: `Table
Form
Url`,
            },
          },
          {
            name: "Coll",
            component: "SelectBox",
            props: {
              collection: "g:'Coll'",
            },
          },
          {
            name: "Form",
            component: "SelectBox",
            props: {
              collection: "g:'Form'",
            },
          },
          {
            name: "url",
            component: "TextBox",
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
          {
            name: "Attr",
            component: "Table2",
            tab: "expand",
            props: {
              type: "NavAttr"
            },
            attributes: [
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
                name: "expanded",
                component: "CheckBox",
              },
              {
                name: "func",
                component: "SelectBox",
                props: {
                  items: `Table
Form
Url`,
                },
              },
              {
                name: "Coll",
                component: "SelectBox",
                props: {
                  collection: "g:'Coll'",
                },
              },
              {
                name: "Form",
                component: "SelectBox",
                props: {
                  collection: "g:'Form'",
                },
              },
              {
                name: "url",
                component: "TextBox",
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
              {
                name: "Attr",
                component: "Table2",
                tab: "expand",
                props: {
                  type: "NavAttr"
                },
                attributes: [
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
                    name: "expanded",
                    component: "CheckBox",
                  },
                  {
                    name: "func",
                    component: "SelectBox",
                    props: {
                      items: `Table
Form
Url`,
                    },
                  },
                  {
                    name: "Coll",
                    component: "SelectBox",
                    props: {
                      collection: "g:'Coll'",
                    },
                  },
                  {
                    name: "Form",
                    component: "SelectBox",
                    props: {
                      collection: "g:'Form'",
                    },
                  },
                  {
                    name: "url",
                    component: "TextBox",
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
                  {
                    name: "Attr",
                    component: "Table2",
                    tab: "expand",
                    props: {
                      type: "NavAttr"
                    },
                    attributes: [
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
                        name: "expanded",
                        component: "CheckBox",
                      },
                      {
                        name: "func",
                        component: "SelectBox",
                        props: {
                          items: `Table
Form
Url`,
                        },
                      },
                      {
                        name: "Coll",
                        component: "SelectBox",
                        props: {
                          collection: "g:'Coll'",
                        },
                      },
                      {
                        name: "Form",
                        component: "SelectBox",
                        props: {
                          collection: "g:'Form'",
                        },
                      },
                      {
                        name: "url",
                        component: "TextBox",
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
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  // TODO: Dynamic Filter on Grid: Role->Filter
};
export interface IFormContext {
  cleanUpConfig: { [key: string]: any; };
  validationGroup: {};
  record: Record;
}

export const FormContext = createContext({} as IFormContext);
export const PageContext = createContext({} as { [key: string]: any; });
export interface FormMetaData {
  name: string; // required to create new vertex
  isInlineEditable?: boolean;
  title: string;
  attributes: FieldAttribute[];
  isRealTime?: boolean;
}
export interface FieldAttribute {
  name: string;
  // tab?: string;
  // group?: string;
  dataType?: string;
  meta?: string;
  component: string;
  displayName?: string;
  props?: {
    [key: string]: any;
    validationRules?: Array<{}>;
  };
  // postSubmit?: (formValues: IFormGroup, formGroup: IFormGroup, tableItemFormGroup: IFormGroup, values: FormResult)=>void
  attributes?: FieldAttribute[];
}
export class Record {
  txnId: number;
  readonly isRealTime: boolean;
  vertex: Vertex;
  ws: ServerEventsDispatcher;
  meta?: Vertex;
  metaVertex: Vertex;

  constructor({
    ws, meta
  }: { ws: ServerEventsDispatcher; meta?: Vertex; }) {

    this.txnId = getNewTxnId();
    this.isRealTime = false;
    this.ws = ws;
    this.meta = meta;
  }

  // create
  create = (label: string, properties?: { [key: string]: any; }): { error: string | boolean; vertex?: Vertex; } => {
    if (!label) {
      // if (!form[IdAttr]) {
      return { error: "Label not found" };
    }
    if (this.isRealTime) {
      this.txnId = getNewTxnId();
    }
    const newVertexObj = newVertex(getNewGraphId(), [label], properties || {});
    // TODO: Do Create Transformation for the vertex
    const addNewVertexResult = addNewVertex(this.txnId, newVertexObj);
    if (addNewVertexResult.error) {
      return addNewVertexResult;
    }
    if (this.isRealTime) commitTxn(this.txnId, this.ws);
    this.vertex = graph.vertexes[newVertexObj.id];
    return {
      error: false, vertex: this.vertex
    };
  };

  load = (id: number): { error: string | boolean; vertex?: Vertex; } => {
    if (!graph.vertexes[id]) {
      return { error: "vertex not found" };
    }
    this.vertex = graph.vertexes[id];

    return {
      error: false, vertex: this.vertex
    };
  };

  createMeta = (form: FormMetaData) => {
    const { attributes, ...custom } = form;

    // save attributes to vertexes
    const metaTxnId = getNewTxnId();
    if (this.meta) {
      this.metaVertex = this.meta;
    } else {
      const metaMainVertex = newVertex(getNewGraphId(), ["Temp"], custom);
      const { error } = addNewVertex(metaTxnId, metaMainVertex);
      if (error) {
        alert(error);
        return;
      }
      this.metaVertex = graph.vertexes[metaMainVertex.id];
    }


    addMetaVertexes(metaTxnId, this.metaVertex, attributes);
    onCleanup(() => {
      revertTransaction(metaTxnId);
    });
    onCleanup(() => {
      if (!this.meta) {
        // TODO: Remove all the meta
      }
    });
  };

  commitTxn = () => {
    // TODO: currently we can only run this function once.
    // we need to set seperate txnId once commited. Fix this.
    commitTxn(this.txnId, this.ws);
  };

  submitForm = () => {
    // we cant have validationGroup when doing code. can we register components on the fly to enable validations?
    // const result = validationGroup.validate();
    const isValid = true; // result.isValid;
    if (isValid) {
      // !!!TODO!!! Handle Error Received From server when commit
      if (!this.isRealTime) {
        commitTxn(this.txnId, this.ws);
      }
    } else {
      alert("please fix all errors");
    }
    return isValid;
  };
  cancelForm = () => {
    revertTransaction(this.txnId);
  };
  setValue = (attribute: Vertex, vertex: Vertex, data: any) => {
    setValueGlobal(this.txnId, attribute, vertex, data, this.ws, this.isRealTime);
  };

  // TODO: Is this method valid? does it delete nested Rows set by this form?, check code written in NavDesigner component to clear the form.
  deleteAllRows = (edgeType: string) => {
    const vertexes = getChildVertexes([edgeType], [this.vertex]).vertexes || [];
    for (const row of vertexes) {
      deleteRow(row, this.isRealTime, this.txnId, this.ws);
    }
  };

  // setFieldValue
  // getFieldValue
  //['getMacros', 'getMacro', 'executeMacro', 'id', 'type', 'isDynamic', 'isReadOnly', 'isNew', 'getMessageService', 'save', 'toJSON', 'toString', 'removeField', 'getFields', 'getSublist', 'getSublists', 'getSublistFields', 'getValue', 'setValue', 'getText', 'setText', 'getField', 'getSublistField', 'getLineCount', 'insertLine', 'removeLine', 'moveLine', 'findSublistLineWithValue', 'cancelLine', 'commitLine', 'selectLine', 'selectNewLine', 'getCurrentSublistValue', 'getSublistValue', 'setCurrentSublistValue', 'getCurrentSublistText', 'getSublistText', 'setCurrentSublistText', 'getCurrentSublistIndex', 'hasSubrecord', 'getSubrecord', 'removeSubrecord', 'hasSublistSubrecord', 'hasCurrentSublistSubrecord', 'getCurrentSublistSubrecord', 'removeCurrentSublistSubrecord', 'getCurrentSublistField', 'setMatrixHeaderValue', 'getMatrixHeaderValue', 'getMatrixSublistValue', 'setMatrixSublistValue', 'setCurrentMatrixSublistValue', 'getCurrentMatrixSublistValue', 'getMatrixHeaderField', 'getMatrixSublistField', 'findMatrixSublistLineWithValue', 'getMatrixHeaderCount', 'on', 'off']
  // "fields": [{ "name": "tobeprinted", "value": "F" }, {
  //   "name": "tobefaxed",
  //   "value": "F",
  //   "firechange": true
  //  }
  replaceFieldValues = (properties: { [key: string]: any; }) => {
    replaceVertexProperties(this.txnId, this.vertex.id, properties);
  };
  mergeFieldValues = (properties: { [key: string]: any; }) => {
    mergeVertexProperties(this.txnId, this.vertex.id, properties);
  };

  getSublist = (name: string) => {
    // return Sublist class, it will return sublist config. calling .getColumn('id') on it will return Column class
  };

  // Returns all the names of all the sublists.
  getSublists = (): string[] => [];

  // record.Record
  // Cancels the currently selected line on a sublist.
  cancelLine = options => {
  };

  // record.Record
  // Commits the currently selected line on a sublist.
  commitLine = options => {
  };

  // record.Record
  // Inserts a sublist line.
  insertLine = (options: { sublistId: string; line: number; ignoreRecalc: boolean; }) => {
  };

  // record.Record
  // Removes a sublist line.
  removeLine = () => {
  };

  // record.Record
  // Selects an existing line in a sublist.
  selectLine = options => {
  };

  // record.Record
  // selectNewLine = addNewLine + selectLine
  // Selects a new line at the end of a sublist.
  selectNewLine = (options: { sublistId: string; properties: { [key: string]: any; }; }) => {
    const newMeta = newRow(this.txnId, this.vertex, options.sublistId, options.sublistId, options.properties);
  };

  // variables: oldValue, newValue
  addNewRowUI = (meta: Vertex, parentVertex: Vertex, properties: { [key: string]: any; }) => {
    return addNewRow(this.txnId, meta, parentVertex, properties, this.isRealTime, this.ws);
  };

  getSublistRowsForType = (type: string, vertex: Vertex) => {
    return getSublistRowsForType(type, vertex);
  };
  getSublistRows = (meta: Vertex, vertex: Vertex) => {
    return getSublistRows(meta, vertex);
  };

  groupByTabsAndGroup = () => {
    const mainAttributes = getChildVertexes(["MetaAttr"], [this.metaVertex]); //.sort((a, b) => a.P.pos - b.P.pos);

    const groupByTabs = groupBy(mainAttributes.vertexes!, (item) => item.P.tab!) as unknown as {
      [tab: string]: Vertex[];
    };

    const groupByTabsAndGroup = {} as {
      [tab: string]: { [group: string]: Vertex[]; };
    };
    for (const tab in groupByTabs) {
      groupByTabsAndGroup[tab] = groupBy(groupByTabs[tab]!, (item) => item.P.group!) as unknown as {
        [group: string]: Vertex[];
      };
    }
    return groupByTabsAndGroup;
  };

  getMetaAttributes = (meta: Vertex) => getChildVertexes(["MetaAttr"], [meta]).vertexes || [];



}

export const addMetaVertexes = (txnId: number, vertex: Vertex, attributes: FieldAttribute[]) => {
  for (const attribute of attributes) {
    // if (attribute?.props?.skip) {
    //   continue;
    // }
    const attr = klona(attribute);
    if (!attr.tab) attr.tab = "main";
    if (!attr.group) attr.group = "main";
    // if(attribute.component === "Table2") attribute.group = attribute.id;
    const addAttributeResult = newRow(txnId, vertex, "MetaAttr", "MetaAttr", attr);
    if (addAttributeResult.error) {
      alert(addAttributeResult.error);
    }
    // todo discard transaction
    // if (attribute.component === "Table2" && attribute.attributes) {
    if (attribute.attributes) {
      addMetaVertexes(txnId, graph.vertexes[addAttributeResult.vertexId!], attribute.attributes);
    }
    // todo discard transaction
  }
};
export function setValueGlobal(txnId: number, attribute: Vertex, vertex: Vertex, data: any, ws: ServerEventsDispatcher, isRealTime: boolean) {
  if (!vertex) {
    return;
  }

  // after commit, we can not use same txnId();
  if (isRealTime) {
    txnId = getNewTxnId();
  }

  mergeVertexProperties(txnId, vertex.id, {
    [attribute.P[IdAttr]]: data
  });

  // we directly save the dataType on vertex:
  setGraph("vertexes", vertex.id, "D", { [attribute.P[IdAttr]]: attribute.P["dataType"] });

  onChangeHandler(txnId, vertex, vertex, attribute);
  if (isRealTime) commitTxn(txnId, ws);
}
export function getSublistRowsForType(type: string, vertex: Vertex) {
  return (getChildVertexes([`${type}`], [vertex]).vertexes || []).sort(
    (a, b) => a.P.pos - b.P.pos
  );
}
export function getSublistRows(meta: Vertex, vertex?: Vertex) {
  if (!vertex) return [];
  // This should check for inward edges too
  const type = getToEdge(meta, vertex);
  return (getChildVertexes([`${type}`], [vertex]).vertexes || []).sort(
    (a, b) => a.P.pos - b.P.pos
  );
}

export function newRow(
  txnId: number,
  parentVertex: Vertex,
  label: string,
  edgeType?: string,
  properties?: { [key: string]: any; }
): { error: boolean; vertexId?: Id; edgeId?: Id; } {
  return batch(() => {
    const vertexNew = newVertex(getNewGraphId(), [label || edgeType!], properties);
    const insertVertex = addNewVertex(txnId, vertexNew);
    if (insertVertex.error) {
      alert(insertVertex.error);
      return {
        error: true
      };
    }

    const edgeNew = newEdge(getNewGraphId(), edgeType || label!, {}, parentVertex.id, vertexNew.id);
    const insertEdgeResult = addNewEdge(txnId, edgeNew);
    if (insertEdgeResult.error) {
      alert(insertEdgeResult.error);
      return {
        error: true,
        vertexId: vertexNew.id
      };
    }
    return {
      error: false,
      vertexId: vertexNew.id,
      edgeId: edgeNew.id
    };
  });
}
export const addNewRow = (
  txnId: number,
  meta: Vertex,
  parentVertex: Vertex,
  properties: { [key: string]: any; },
  isRealTime: boolean,
  Ws: ServerEventsDispatcher
) => {
  if (isRealTime) {
    txnId = getNewTxnId();
  }
  const type = getToEdge(meta, parentVertex);
  const label = getValueFromVertexOrKey(meta.P.props || {}, "label");

  const newRowResult = newRow(txnId, parentVertex, label, type, properties);
  if (isRealTime) commitTxn(txnId, Ws);
  return newRowResult;
};
export function onChangeHandler(txnId: number, formVertex: Vertex, vertex: Vertex, changedFieldAttribute: Vertex) {
  if (!changedFieldAttribute.P.props?.onchange) return;
  const isNew = formVertex.id < 0;
  try {
    let args = JSON.parse(changedFieldAttribute.P.props.onchange);
    if (Array.isArray(args)) {
      // args in proper format.
    } else if (isObject(args)) {
      // TODO: Find the form is new or edit.
      if (args.new && isNew) {
        args = args.new;
      } else if (args.edit) {
        args = args.edit;
      } else {
        return;
      }
    }

    const attribute = (getSelectionOptions([changedFieldAttribute], "-MetaAttr->MetaAttr").vertexes || []).find(
      (vertex) => vertex.P[IdAttr] === args[0]
    );
    if (!attribute) {
      return;
    }
    let value = args[1];

    if (value === null) value = undefined;
    if (value === "label") value = getLabel(vertex.P[changedFieldAttribute.P[IdAttr]]);
    if (value === "id") value = getId(vertex.P[changedFieldAttribute.P[IdAttr]]);
    if (value === "clear") value = null;
    if (attribute.P.component == "Select" || attribute.P.component === "Tag") {
      setSelectionValue(txnId, vertex, attribute, value);
    } else {
      mergeVertexProperties(txnId, vertex.id, {
        [attribute.P[IdAttr]]: value
      });
    }
  } catch (e) {
    console.log("Error In On Change ", e);
  }
}
//'setValue(component,null)'

export function getLabel(input: string) {
  input = input.replaceAll(" ", "");
  input = capitalizeFirstLetter(input);
  // TODO: letter make pascalCase letter
  return input;
}

export function getId(input: string) {
  input = input.replaceAll(" ", "");
  input = (input).toLowerCase();
  // TODO: letter make pascalCase letter
  return input;
}

