import { PROPERTIES } from "~/components/constants/constant";
import { findVertexByLabelAndUniqueIdWithSkip } from "~/lib/graph/get/sync/findVertex";

import { useGraph } from "../../graph/graph";

export const Nav = {
  attributes: [
    {
      componentName: "SystemString",
      key: "title",
      onchange: '{"new": ["key","id"]}',
    },
    {
      componentName: "SystemString",
      key: "key",
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
              "Navigation",
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
      class: PROPERTIES.Css.TextField,
      componentName: "SystemTextArea",
      key: "description",
    },
    {
      attributes: [
        {
          componentName: "SystemString",
          displayName: "ID",
          key: "key",
        },
        {
          class: PROPERTIES.Css.TextField,
          componentName: "SystemTextArea",
          key: "definition",
        },
        {
          componentName: "SystemBoolean",
          key: "expanded",
        },
        {
          componentName: "SelectBox",
          items: `Table
Form
Url`,

          key: "func",
        },
        {
          collection: "g:'Form'",
          componentName: "SelectBox",

          key: "Form",
        },
        {
          componentName: "SystemString",
          key: "url",
        },
        {
          attributes: [
            {
              collection: "g:'Role'",
              componentName: "SelectBox",

              key: "role",
            },
            {
              attributes: [
                {
                  collection: "g:'Perm'",
                  componentName: "SelectBox",

                  key: "perm",
                },
              ],
              componentName: "DynamicTable",
              key: "Perm",
            },
          ],
          componentName: "DynamicTable",
          key: "Role",
          tab: "Permission",
        },
        {
          attributes: [
            {
              componentName: "SystemString",
              displayName: "ID",
              key: "key",
            },
            {
              class: PROPERTIES.Css.TextField,
              componentName: "SystemTextArea",
              key: "definition",
            },
            {
              componentName: "SystemBoolean",
              key: "expanded",
            },
            {
              componentName: "SelectBox",
              items: `Table
Form
Url`,

              key: "func",
            },
            {
              collection: "g:'Form'",
              componentName: "SelectBox",

              key: "Form",
            },
            {
              componentName: "SystemString",
              key: "url",
            },
            {
              attributes: [
                {
                  collection: "g:'Role'",
                  componentName: "SelectBox",

                  key: "role",
                },
                {
                  attributes: [
                    {
                      collection: "g:'Perm'",
                      componentName: "SelectBox",

                      key: "perm",
                    },
                  ],
                  componentName: "DynamicTable",
                  key: "Perm",
                },
              ],
              componentName: "DynamicTable",
              key: "Role",
              tab: "Permission",
            },
            {
              attributes: [
                {
                  componentName: "SystemString",
                  displayName: "ID",
                  key: "key",
                },
                {
                  class: PROPERTIES.Css.TextField,
                  componentName: "SystemTextArea",
                  key: "definition",
                },
                {
                  componentName: "SystemBoolean",
                  key: "expanded",
                },
                {
                  componentName: "SelectBox",
                  items: `Table
Form
Url`,

                  key: "func",
                },
                {
                  collection: "g:'Form'",
                  componentName: "SelectBox",

                  key: "Form",
                },
                {
                  componentName: "SystemString",
                  key: "url",
                },
                {
                  attributes: [
                    {
                      collection: "g:'Role'",
                      componentName: "SelectBox",

                      key: "role",
                    },
                    {
                      attributes: [
                        {
                          collection: "g:'Perm'",
                          componentName: "SelectBox",

                          key: "perm",
                        },
                      ],
                      componentName: "DynamicTable",
                      key: "Perm",
                    },
                  ],
                  componentName: "DynamicTable",
                  key: "Role",
                  tab: "Permission",
                },
                {
                  attributes: [
                    {
                      componentName: "SystemString",
                      displayName: "ID",
                      key: "key",
                    },
                    {
                      class: PROPERTIES.Css.TextField,
                      componentName: "SystemTextArea",
                      key: "definition",
                    },
                    {
                      componentName: "SystemBoolean",
                      key: "expanded",
                    },
                    {
                      componentName: "SelectBox",
                      items: `Table
Form
Url`,

                      key: "func",
                    },
                    {
                      collection: "g:'Form'",
                      componentName: "SelectBox",

                      key: "Form",
                    },
                    {
                      componentName: "SystemString",
                      key: "url",
                    },
                    {
                      attributes: [
                        {
                          collection: "g:'Role'",
                          componentName: "SelectBox",

                          key: "role",
                        },
                        {
                          attributes: [
                            {
                              collection: "g:'Perm'",
                              componentName: "SelectBox",

                              key: "perm",
                            },
                          ],
                          componentName: "DynamicTable",
                          key: "Perm",
                        },
                      ],
                      componentName: "DynamicTable",
                      key: "Role",
                      tab: "Permission",
                    },
                  ],
                  componentName: "DynamicTable",
                  key: "Attr",

                  tab: "expand",

                  type: "NavAttr",
                },
              ],
              componentName: "DynamicTable",
              key: "Attr",

              tab: "expand",

              type: "NavAttr",
            },
          ],
          componentName: "DynamicTable",
          key: "Attr",

          tab: "expand",

          type: "NavAttr",
        },
      ],
      componentName: "DynamicTable",
      key: "Attr",

      tab: "Attributes",

      type: "NavAttr",
    },
  ],
  key: "Nav",
  title: "Navigation",
};
