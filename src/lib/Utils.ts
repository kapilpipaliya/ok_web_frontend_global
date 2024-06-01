import { createContext, splitProps, useContext } from "solid-js";
import { findVertexByLabelAndUniqueIdWithSkip } from "./graph/get/sync/findVertex";
import { GraphContext, type GraphInterface, type Vertex } from "~/lib/graph/graph";
import { AttrsAdminTableData } from "~/lib/apiAdmin";
import { type FieldAttribute, FormMetaData } from "~/lib/Type";
import type { SetStoreFunction, Store } from "solid-js/store";
import {
  getChildVertex,
  getInEdge,
  getSelectionOptions,
  getToEdge,
} from "./graph/get/sync/traverse";
import type { Expression } from "jsep";

export const APP_BASE_URL = "/admin";
export const APP_BASE_URL_NAME = "Admin";
export const breadcrumbData = [
  { name: "Home", href: `${APP_BASE_URL}`, icon: "ic:baseline-home" },
];
export function nameExpr(v: Vertex, graph: Store<GraphInterface>) {
  const component = getChildVertex(graph, ["$0Comp"], v).vertex?.P.name;
  return `${v.P.name}${component ? ` (${component})` : ""}`;
}

export function expressionString(params: {
  coll?: string;
  skip?: number;
  limit?: number;
  filter?: string;
  custom?: string;
}): string {
  const [field, rest] = splitProps(params, [
    "coll",
    "skip",
    "limit",
    "filter",
    "custom",
  ]);
  if (field.custom) {
    return field.custom;
  }

  let dynamicString = "";

  if (field.coll) {
    dynamicString += `g:'${field.coll}`;
    const options = [];

    if (field.filter) options.push(field.filter);
    if (field.skip !== undefined) options.push(`skip=${field.skip}`);
    if (field.limit !== undefined && field.limit !== 0)
      options.push(`limit=${field.limit}`);

    if (options.length > 0) {
      dynamicString += `[${options.join(" ")}]`;
    }

    dynamicString += "'";
  } else {
    throw new Error("Either 'coll' or 'custom' must be provided.");
  }

  return dynamicString;
}

export const iconMap: any = {
  TextInput: "streamline:input-box",
  Icon: "mynaui:letter-i-hexagon",
  Image: "mage:image",
  A: "ph:link-bold",
  Text: "ci:text",
  Repeater: "formkit:repeater",
  TabPanel: "material-symbols:backup-table-rounded",
  TreeView:"ph:tree-view-light",
  Page: "fluent:form-20-regular",
  Label:"mdi:label-outline",
  Box: "mage:box-3d-scan",
  ProgressBar: "carbon:progress-bar",
  LoadIndicator: "ep:loading",
  SelectBox: "radix-icons:dropdown-menu",
  TagBox: "radix-icons:dropdown-menu",
  Tabs: "material-symbols-light:tabs-outline",
  Button: "teenyicons:button-outline",
  Breadcrumb: "tdesign:component-breadcrumb",
  Autocomplete: "fluent-mdl2:completed",
  CheckBox: "tabler:checkbox",
  ColorBox: "ic:outline-color-lens",
  DateBox: "circum:calendar-date",
  FileUploader: "arcticons:custom-uploader",
  Form: "lets-icons:form-duotone",
  NumberBox: "fluent-emoji-high-contrast:input-numbers",
  RadioGroup: "ri:list-radio",
  Radio: "fluent:radio-button-16-filled",
  Switch: "iconoir:switch-off",
  HtmlEditor: "mdi:code-block-html",
  Table: "material-symbols-light:table",
  TextArea: "bi:textarea",
  TextBox: "ph:textbox",
  ScrollView: "mdi:scroll",
  FormSubmit: "ant-design:file-done-outlined",
  FormCancel: "oui:index-close",
  TableHeader: "fluent:dual-screen-header-20-regular",
  TableRow: "carbon:row",
  TabContainer: "fluent:tabs-20-regular",
  TabList: "fluent:tab-desktop-20-regular",
  TreeViewItem: "tdesign:tree-list",
  TreeViewChild: "carbon:tree-view-alt",
  Collapsible: "lets-icons:collapse",
};

export const getTextColumnValue = (value: any) => {
  function isObject(value: any): boolean {
    // Check if the value is not null and its type is 'object'
    return value !== null && typeof value === "object";
  }

  if (value === true) {
    return "True";
  }if (value === false) {
    return "False";
  }
  if (!value) {
    return "";
  }

  if (Array.isArray(value)) {
    const values = [];
    for (const v of value) {
      values.push(getTextColumnValue(v));
    }
    value = values.join(", ");
  }

  return isObject(value) ? JSON.stringify(value) : value;
};

export function validateEmail(email: string) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Please enter a valid email address";
  }
  return undefined; // No error, email is valid
}

export function validateUsername(username: string) {
  if (username.length < 3) {
    return "Please enter a valid username";
  }
  return undefined; // No error, email is valid
}

export function getEdgesFromRowsAttr(attrs: any): {
  incoming: Expression[];
  outgoing: Expression[];
} {
  const outgoing = [] as Expression[];
  const incoming = [] as Expression[];

  for (const attribute of attrs) {
    if (
      attribute.component === "SelectBox" ||
      attribute.component === "TagBox"
    ) {
      if (attribute.props?.inward) {
        incoming.push({
          expression: `<-${getInEdge({ P: attribute } as Vertex, { L: ["$0"] } as Vertex)}`,
          type: "",
        }); // `<-${capitalizedName}$0`
      } else {
        outgoing.push({
          expression: `->${getToEdge({ P: attribute } as Vertex, { L: ["$0"] } as Vertex)}`,
          type: "",
        }); // `->$0${capitalizedName}`
      }
    } else if (
      attribute.component === "Table" ||
      attribute.component === "Table2"
    ) {
      const expression: Expression = {
        expression: `->${getToEdge({ P: attribute } as Vertex, { L: ["$0"] } as Vertex)}`,
        type: "",
      };

      if (attribute.attributes) {
        const nested = getEdgesFromRowsAttr(attribute.attributes);
        expression.incoming = nested.incoming;
        expression.outgoing = nested.outgoing;
      }
      outgoing.push(expression);
    }
  }

  return { incoming, outgoing };
}
export function replaceExpressionToLabel(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  collection: string,
  vertex: Vertex,
) {
  if (!collection) return "";
  // example: `{->$0Coll::'P.${IdAttr}'}` will get a collection from expression
  if (collection.includes("{{") && collection.includes("}}")) {
    collection = collection.replace(
      /{{.*}}/,
      getSelectionOptions(
        graph,
        setGraph,
        [vertex],
        collection.match(/{{(.*)}}/)?.[1]! || "",
      ).vertexes || "",
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
// Keep max level 10, else the Page navigation is very slow. because revert transaction on record takes so much time.
for (let i = 0; i < 10; i++) {
  const attributes = JSON.parse(JSON.stringify(pageAttr));
  pageChildAttrs.attributes = attributes;
  pageChildAttrs = attributes[attributes.length - 1];
}

export interface IFormContext {
  cleanUpConfig: () => { [key: string]: any };
  validationGroup?: {};
  txnId: number;
  formMeta: Vertex;
  formData: Vertex;
}

export const FormContext = createContext({} as IFormContext);
export const PageContext = createContext({} as { [key: string]: any });
export function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
export function getValueFromVertexOrKey(
  obj: { [key: string]: Vertex } | any,
  key: string,
) {
  return obj?.[key];
  // return obj[key]?.id ? obj[key].P.value : obj[key];
}

export function isObject(i: any) {
  if (i && !Array.isArray(i)) {
    return "object" === typeof i;
  }
    return !1;
}

export function groupBy(
  xs: { [key: string]: any }[],
  groupFn: (record: { [key: string]: any }) => string,
) {
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

//'setValue(component,null)'

export function getLabel(input: string) {
  input = input.replaceAll(" ", "");
  input = capitalizeFirstLetter(input);
  // TODO: letter make pascalCase letter
  return input;
}

export function getId(input: string) {
  input = input.replaceAll(" ", "");
  input = input.toLowerCase();
  // TODO: letter make pascalCase letter
  return input;
} // ts-belt
export function isNumber(i: any) {
  if ("number" === typeof i) {
    return !Number.isNaN(i);
  }
    return !1;
}
