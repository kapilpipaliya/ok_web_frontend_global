import {findVertexByLabelAndUniqueIdWithSkip} from "./Vertex";

import {FormMetaData} from "./Type";
import {IFormContext} from "./Utils";

export const AttrsAdminTableData: { [key: string]: FormMetaData; } = {
  User: {
    title: "User",
    name: "User",
    isInlineEditable: true,
    attributes: [
      {name: "name", component: "TextBox"},
      {name: "email", component: "TextBox"},
      {name: "pass", component: "TextBox"},
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
    attributes: [{name: "name", component: "TextBox"}],
  },
  Role: {
    title: "Role",
    name: "Role",
    isInlineEditable: true,
    attributes: [{name: "name", component: "TextBox"}],
  },
  Dashboard: {
    title: "Dashboards",
    name: "Dashboard",
    isInlineEditable: true,
    attributes: [
      {name: "name", component: "TextBox"},
      {name: "description", component: "TextArea"},
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
        props: {width: 600, height: 500},
      },
      {name: "label", component: "TextBox"},
      {name: "dry", component: "CheckBox"},
      {name: "lookup", component: "TextBox"},
      {name: "lookupId", component: "TextBox"},
      {name: "lookupChild", component: "TextBox"},
      {
        name: "meta",
        component: "Table2",
        attributes: [
          {name: "column", component: "TextBox"},
          // {
          //  name: "column",
          //  component: "SelectBox",
          //  props: {
          //   displayExpr: "key",
          //   collection: "Update Dynamically on meta based on first row",
          //  },
          // },
          {name: "attrId", displayName: "Attribute ID", component: "TextBox"},
          {
            name: "coll",
            displayName: "Lookup Collection",
            component: "SelectBox",
            props: {
              displayExpr: "name",
              collection: "g:'Coll'",
            },
          },
          {name: "collLabel", displayName: "Lookup Label", component: "TextBox"},
          {name: "inward", component: "CheckBox"},
          {
            name: "collId",
            displayName: "Lookup Collection ID",
            component: "TextBox",
          },
          {name: "edge", displayName: "Edge Type", component: "TextBox"},
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
          {name: "skip", component: "CheckBox"},
          {name: "skipRow", component: "TextArea"},
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
              validationCallback: (options: any) => {
                const {record} = options.validator.context || {} as IFormContext;

                const val = options.value;
                return !findVertexByLabelAndUniqueIdWithSkip("Navigation", "id", val, record.vertex.id);
              },
            },
          ],
        },
      },
      {name: "description", component: "TextArea"},
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