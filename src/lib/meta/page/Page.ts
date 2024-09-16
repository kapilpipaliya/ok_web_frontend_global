import type { IFormMetaData } from "~/lib/meta/FormMetadataType";

import { PROPERTIES } from "~/components/constants/constant";
import { findVertexByLabelAndUniqueIdWithSkip } from "~/lib/graph/get/sync/findVertex";

import { useGraph } from "../../graph/graph";
import { pageAttr } from "./pageAttr";

export const Page: IFormMetaData = {
  attributes: [
    {
      componentName: "SystemString",
      key: "title",
      containerClass: "p:8 w:100% b:1px|solid|#ccc",
      // onchange: '{"new": ["key","id"]}', // TODO: Fix this, it's not working with kobalte
    },
    {
      containerClass: "p:8 w:100% b:1px|solid|#ccc",
      componentName: "SystemString",
      key: "key",
      validation: { required: true },

      validationRules: [
        {
          message: "ID is required",
          type: "required",
        },
        {
          ignoreEmptyValue: true,
          message: "This ID is already taken",
          type: "custom",
          // validationCallback: (options: any) => {
          //   const { formData } =
          //     (options.validator.context as FormContext) ||
          //     ({} as FormContext);
          //   const [graph, _setGraph] = useGraph();
          //   const val = options.value;
          //   return !findVertexByLabelAndUniqueIdWithSkip(
          //     "Page",
          //     "id",
          //     val,
          //     formData.id,
          //     graph,
          //   );
          // },
        },
      ],
    },
    {
      class: `${PROPERTIES.Css.TextField} p:8 w:100%`,
      componentName: "SystemTextArea",
      key: "description",
    },
    {
      collection: "g:'Dashboard'",
      componentName: "TagBox",
      inward: true,
      key: "dashboard",
      parentLabel: "Dashboard",
    },
    { componentName: "SystemBoolean", key: "public" },
    /*{ componentName: "SystemBoolean", key: "isRealTime" },
    {
      collection: "g:'Form'",
      componentName: "SelectBox",
      displayName: "Collection",
      
        key: "coll",
        // inward: true,
        parentLabel: "Form",
      
    },
    {
      collection: `g:'{{->$0Coll::'P.key'}}'`,
      componentName: "SelectBox",
        key: "data",
    },*/
    {
      attributes: pageAttr,
      componentName: "DynamicTable",
      key: "Attr",
      label: "Attr",
      tab: "Attribute",
      type: "Attr",
    },
    {
      collection: "->$0Perm",
      componentName: "TagBox",
      key: "globalPerm",
    },
  ],
  key: "Page",
  title: "Page",
};
