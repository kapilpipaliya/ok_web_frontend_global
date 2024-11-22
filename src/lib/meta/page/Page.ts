import type { IFormMetaData } from "~/lib/meta/FormMetadataType";

import { PROPERTIES } from "~/components/styled/constants/constant";

import { pageAttr } from "./pageAttr";

export const Page: IFormMetaData = {
  attributes: [
    {
      attributes: [
        {
          componentName: "SystemString",
          containerClass: PROPERTIES.Css.TextField,
          key: "title",
          // onchange: '{"new": ["key","id"]}', // TODO: Fix this, it's not working with kobalte
        },
        {
          componentName: "SystemString",
          containerClass: PROPERTIES.Css.TextField,
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
          class: PROPERTIES.Css.TextField,
          componentName: "SystemTextArea",
          key: "description",
        },
        // {
        //   collection: "g:'Dashboard'",
        //   componentName: "MultiSelect",
        //   inward: true,
        //   key: "dashboard",
        //   parentLabel: "Dashboard",
        // },
        { componentName: "SystemBoolean", key: "public" },
        /*{ componentName: "SystemBoolean", key: "isRealTime" },
        {
          collection: "g:'Form'",
          componentName: "Select",
          displayName: "Collection",
          
            key: "coll",
            // inward: true,
            parentLabel: "Form",
          
        },
        {
          collection: `g:'{{->$0Coll::'P.key'}}'`,
          componentName: "Select",
            key: "data",
        },*/
        {
          attributes: pageAttr,
          componentName: "DynamicTable",
          hidden: true,
          key: "Attr",
          label: "Attr",
          tab: "Attribute",
          type: "Attr",
        },
        {
          collection: "->$0Perm",
          componentName: "MultiSelect",
          hidden: true,
          key: "globalPerm",
        },
      ],
      class: "d:flex flex:col gap:8",
      componentName: "Box",
      key: "box",
    },
  ],
  key: "Page",
  title: "Page",
};
