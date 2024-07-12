import type { IFormMetaData } from "~/lib/FormMetadataType";
import type { IFormContext } from "~/lib/contexts";

import { findVertexByLabelAndUniqueIdWithSkip } from "~/lib/graph/get/sync/findVertex";

import { useGraph } from "../graph/graph";
import { pageAttr } from "./pageAttr";

export const Page: IFormMetaData = {
  attributes: [
    {
      class: 'p:8 w:100%',
      component: "TextBox",

      name: "title",
      onchange: '{"new": ["name","id"]}'
    },
    {
      class: 'p:8 w:100%',
      component: "TextBox",
      name: "name",

      validationRules: [
        {
          message: "ID is required",
          type: "required",
        },
        {
          ignoreEmptyValue: true,
          message: "This ID is already taken",
          type: "custom",
          validationCallback: (options: any) => {
            const { formData } = (options.validator.context as IFormContext) ||
              ({} as IFormContext);
            const [graph, setGraph] = useGraph();
            const val = options.value;
            return !findVertexByLabelAndUniqueIdWithSkip(
              "Page",
              "id",
              val,
              formData.id,
              graph
            );
          },
        },
      ],
    },
    { class: 'p:8 w:100%',component: "TextArea", name: "description" },
    {
      collection: "g:'Dashboard'",
      component: "TagBox",

      inward: true,
      name: "dashboard",
      parentLabel: "Dashboard",
    },
    { component: "CheckBox", name: "public" },
    /*{ component: "CheckBox", name: "isRealTime" },
    {
      collection: "g:'Form'",
      component: "SelectBox",
      displayName: "Collection",
      
        name: "coll",
        // inward: true,
        parentLabel: "Form",
      
    },
    {
      collection: `g:'{{->$0Coll::'P.name'}}'`,
      component: "SelectBox",
        name: "data",
    },*/
    {
      attributes: pageAttr,
      component: "DynamicTable",
      label: "Attr",

      name: "Attr",
      tab: "Attribute",

      type: "Attr",
    },
    {
      attributes: [
        {
          collection: "g:'Role'",
          component: "SelectBox",

          name: "role",
        },
        {
          attributes: [
            {
              collection: "g:'Perm'",
              component: "SelectBox",

              name: "perm",
            },
          ],
          component: "DynamicTable",
          name: "Perm",
        },
      ],
      component: "DynamicTable",
      name: "Role",
      tab: "Permission",
    },
  ],
  name: "Page",
  title: "Page",
};
