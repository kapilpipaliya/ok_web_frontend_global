import type { IFormContext } from "~/components/form/FormContext";
import type { IFormMetaData } from "~/lib/meta/FormMetadataType";

import {
  textFieldInputMeta,
  textFieldTextAreaMeta,
} from "~/components/constants/textFieldInput";
import { findVertexByLabelAndUniqueIdWithSkip } from "~/lib/graph/get/sync/findVertex";

import { useGraph } from "../../graph/graph";
import { pageAttr } from "./pageAttr";

export const Page: IFormMetaData = {
  attributes: [
    {
      attributes: [textFieldInputMeta],
      class: "p:8 w:100%",
      componentName: "TextField",
      name: "title",
      // onchange: '{"new": ["name","id"]}', // TODO: Fix this, it's not working with kobalte
    },
    {
      attributes: [textFieldInputMeta],
      class: "p:8 w:100%",
      componentName: "TextField",
      name: "name",
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
          validationCallback: (options: any) => {
            const { formData } =
              (options.validator.context as IFormContext) ||
              ({} as IFormContext);
            const [graph, _setGraph] = useGraph();
            const val = options.value;
            return !findVertexByLabelAndUniqueIdWithSkip(
              "Page",
              "id",
              val,
              formData.id,
              graph,
            );
          },
        },
      ],
    },
    {
      attributes: [textFieldTextAreaMeta],
      class: "p:8 w:100%",
      componentName: "TextField",
      name: "description",
    },
    {
      collection: "g:'Dashboard'",
      componentName: "TagBox",
      inward: true,
      name: "dashboard",
      parentLabel: "Dashboard",
    },
    { componentName: "CheckBox", name: "public" },
    /*{ componentName: "CheckBox", name: "isRealTime" },
    {
      collection: "g:'Form'",
      componentName: "SelectBox",
      displayName: "Collection",
      
        name: "coll",
        // inward: true,
        parentLabel: "Form",
      
    },
    {
      collection: `g:'{{->$0Coll::'P.name'}}'`,
      componentName: "SelectBox",
        name: "data",
    },*/
    {
      attributes: pageAttr,
      componentName: "DynamicTable",
      label: "Attr",
      name: "Attr",
      tab: "Attribute",
      type: "Attr",
    },
    {
      collection: "->$0Perm",
      componentName: "TagBox",
      name: "globalPerm",
    },
  ],
  name: "Page",
  title: "Page",
};
