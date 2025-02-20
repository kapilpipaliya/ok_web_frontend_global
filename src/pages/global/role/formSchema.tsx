import { createStore } from "solid-js/store";

import type { FunctionArgumentType } from "~/components/form/FieldSchemaType";
import type { FieldAttribute } from "~/lib/meta/FormMetadataType";

import { PROPERTIES } from "~/components/styled/constants/constant";
import { SETTINGS_CONSTANTS } from "~/pages/settings/constants";

export const permissionsTableSchema = (label: string) =>
  ({
    attributes: [
      {
        collection: `g:'${label}'`,
        componentName: "Select",
        key: label,
      },
      {
        componentName: "Select",
        displayName: "Access Level",
        key: "access",
        options: `NONE
VIEW
CREATE
EDIT
FULL`,
      },
      // {
      //   componentName: "TextInput",
      //   key: "scope",
      // },
    ],
    componentName: "DynamicTable",
    key: label,
  }) as FieldAttribute;

export const formSchema = {
  as: "div",
  attributes: [
    {
      as: "div",
      attributes: [
        {
          as: "div",
          attributes: [
            {
              class: SETTINGS_CONSTANTS.LABEL_CLASS,
              componentName: "Text",
              text: "Name",
              validation: { required: true },
            },
            {
              class: PROPERTIES.Css.TextField,
              componentName: "TextInput",
              key: "key",
              placeholder: "Enter role name",
              validation: { required: true },
            },
          ],
          class: SETTINGS_CONSTANTS.GRID_ITEM_CLASS,
          componentName: "Box",
        },
        {
          as: "div",
          attributes: [
            {
              class: SETTINGS_CONSTANTS.LABEL_CLASS,
              componentName: "Text",
              text: "Description",
            },
            {
              class: PROPERTIES.Css.TextField,
              componentName: "TextInput",
              key: "description",
              placeholder: "Enter role description",
            },
          ],
          class: SETTINGS_CONSTANTS.GRID_ITEM_CLASS,
          componentName: "Box",
        },
        {
          as: "div",
          attributes: [
            {
              class: SETTINGS_CONSTANTS.LABEL_CLASS,
              componentName: "Text",
              text: "Permissions",
            },
            {
              class: PROPERTIES.Css.TextField,
              componentName: "TextInput",
              key: "permissions",
              placeholder: "Enter permissions",
            },
          ],
          class: SETTINGS_CONSTANTS.GRID_ITEM_CLASS,
          componentName: "Box",
        },
      ],
      class: SETTINGS_CONSTANTS.FORM_CLASS,
      componentName: "Box",
    },
    {
      attributes: [
        {
          as: "div",
          attributes: [
            {
              class: "cursor:pointer p:8|16 ",
              componentName: "Button",
              props: (options: FunctionArgumentType) => ({
                class:
                  options.dataContext.tabState[0]?.activeTab === "Perm"
                    ? "bb:2px|solid|primary"
                    : "bb:2px|solid|transparent",
                onClick: () =>
                  options.dataContext.tabState[1]("activeTab", "Perm"),
                text: "Permissions",
              }),
            },
            {
              class: "cursor:pointer p:8|16 ",
              componentName: "Button",
              props: (options: FunctionArgumentType) => ({
                class:
                  options.dataContext.tabState[0]?.activeTab === "Page"
                    ? "bb:2px|solid|primary"
                    : "bb:2px|solid|transparent",
                onClick: () =>
                  options.dataContext.tabState[1]("activeTab", "Page"),
                text: "Pages",
              }),
            },
            {
              class: "cursor:pointer p:8|16 ",
              componentName: "Button",
              props: (options: FunctionArgumentType) => ({
                class:
                  options.dataContext.tabState[0]?.activeTab === "Form"
                    ? "bb:2px|solid|primary"
                    : "bb:2px|solid|transparent",
                onClick: () =>
                  options.dataContext.tabState[1]("activeTab", "Form"),
                text: "Forms",
              }),
            },
          ],
          class: "display:flex bb:1px|solid|base-20",
          componentName: "Box",
        },
        {
          as: "div",
          attributes: [
            {
              as: "div",
              attributes: [permissionsTableSchema("Perm")],
              componentName: "Box",
              props: (options: FunctionArgumentType) => ({
                class:
                  options.dataContext.tabState[0]?.activeTab === "Perm"
                    ? ""
                    : "d:none",
              }),
            },
            {
              as: "div",
              attributes: [permissionsTableSchema("Page")],
              componentName: "Box",
              props: (options: FunctionArgumentType) => ({
                class:
                  options.dataContext.tabState[0]?.activeTab === "Page"
                    ? ""
                    : "d:none",
              }),
            },
            {
              as: "div",
              attributes: [permissionsTableSchema("Form")],
              componentName: "Box",
              props: (options: FunctionArgumentType) => ({
                class:
                  options.dataContext.tabState[0]?.activeTab === "Form"
                    ? ""
                    : "d:none",
              }),
            },
          ],
          class: "mt:16",
          componentName: "Box",
        },
      ],
      componentName: "Data",
      name: "tabState",
      noRepeat: true,
      props: () => ({
        data: createStore({
          activeTab: "Perm",
        }),
      }),
    },
  ],
  componentName: "Box",
};
