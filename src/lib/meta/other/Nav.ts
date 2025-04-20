import { findVertexByLabelAndUniqueIdWithSkip } from "~/lib/graph/get/sync/entity/findVertex";
import { useGraph } from "~/lib/graph/GraphContext";
import { PROPERTIES } from "~/pages/settings/constants";

export const Nav = {
  attributes: [
    {
      componentName: "TextInput",
      key: "title",
      onchange: '{"new": ["key","id"]}',
    },
    {
      componentName: "TextInput",
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
      css: PROPERTIES.Css.TextFieldCss,
      componentName: "TextArea",
      key: "description",
    },
    {
      attributes: [
        {
          componentName: "TextInput",
          displayName: "ID",
          key: "key",
        },
        {
          css: PROPERTIES.Css.TextFieldCss,
          componentName: "TextArea",
          key: "definition",
        },
        {
          componentName: "CheckBox",
          key: "expanded",
        },
        {
          componentName: "Select",
          items: `Table
Form
Url`,

          key: "func",
        },
        {
          collection: "g:'Form'",
          componentName: "Select",

          key: "Form",
        },
        {
          componentName: "TextInput",
          key: "url",
        },
        {
          attributes: [
            {
              collection: "g:'Role'",
              componentName: "Select",

              key: "role",
            },
            {
              attributes: [
                {
                  collection: "g:'Perm'",
                  componentName: "Select",

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
              componentName: "TextInput",
              displayName: "ID",
              key: "key",
            },
            {
              css: PROPERTIES.Css.TextFieldCss,
              componentName: "TextArea",
              key: "definition",
            },
            {
              componentName: "CheckBox",
              key: "expanded",
            },
            {
              componentName: "Select",
              items: `Table
Form
Url`,

              key: "func",
            },
            {
              collection: "g:'Form'",
              componentName: "Select",

              key: "Form",
            },
            {
              componentName: "TextInput",
              key: "url",
            },
            {
              attributes: [
                {
                  collection: "g:'Role'",
                  componentName: "Select",

                  key: "role",
                },
                {
                  attributes: [
                    {
                      collection: "g:'Perm'",
                      componentName: "Select",

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
                  componentName: "TextInput",
                  displayName: "ID",
                  key: "key",
                },
                {
                  css: PROPERTIES.Css.TextFieldCss,
                  componentName: "TextArea",
                  key: "definition",
                },
                {
                  componentName: "CheckBox",
                  key: "expanded",
                },
                {
                  componentName: "Select",
                  items: `Table
Form
Url`,

                  key: "func",
                },
                {
                  collection: "g:'Form'",
                  componentName: "Select",

                  key: "Form",
                },
                {
                  componentName: "TextInput",
                  key: "url",
                },
                {
                  attributes: [
                    {
                      collection: "g:'Role'",
                      componentName: "Select",

                      key: "role",
                    },
                    {
                      attributes: [
                        {
                          collection: "g:'Perm'",
                          componentName: "Select",

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
                      componentName: "TextInput",
                      displayName: "ID",
                      key: "key",
                    },
                    {
                      css: PROPERTIES.Css.TextFieldCss,
                      componentName: "TextArea",
                      key: "definition",
                    },
                    {
                      componentName: "CheckBox",
                      key: "expanded",
                    },
                    {
                      componentName: "Select",
                      items: `Table
Form
Url`,

                      key: "func",
                    },
                    {
                      collection: "g:'Form'",
                      componentName: "Select",

                      key: "Form",
                    },
                    {
                      componentName: "TextInput",
                      key: "url",
                    },
                    {
                      attributes: [
                        {
                          collection: "g:'Role'",
                          componentName: "Select",

                          key: "role",
                        },
                        {
                          attributes: [
                            {
                              collection: "g:'Perm'",
                              componentName: "Select",

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
