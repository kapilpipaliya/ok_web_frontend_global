import { createStore } from "solid-js/store";

import type { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";
import type { MutationResult } from "~/cypher/types/MutationArgs";
import type { Vertex } from "~/lib/graph/graph";
import type {
  FieldAttribute,
  IFormMetaData,
} from "~/lib/meta/FormMetadataType";

import { useToast } from "~/components/styled/Toast";
import { SYSTEM_ROLES } from "~/cypher/permissions/types";
import { API } from "~/lib/api/endpoints";
import { postAPI } from "~/lib/api/general/postApi";
import { evalExpression } from "~/lib/expression_eval";
import { onMutatDataGet } from "~/lib/graph/mutate/data/onMutatDataGet";
import { commitTxn } from "~/lib/graph/transaction/core/commitTxn";
import { PROPERTIES, SETTINGS_CONSTANTS } from "~/pages/settings/constants";
import { addEditButtonSchema } from "~/pages/subdomain/functions/addEditButtonSchema";

import { loadingIconSchema } from "./loadingIconSchema";

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

export const roleFormSchema = {
  as: "div",
  attributes: [
    loadingIconSchema(),
    {
      as: "div",
      attributes: [
        {
          as: "div",
          attributes: [
            {
              as: "span",
              class: SETTINGS_CONSTANTS.LABEL_CLASS,
              componentName: "Html",
              text: "Name",
              validation: { required: true },
            },
            {
              class: PROPERTIES.Css.TextField,
              componentName: "TextInput",
              key: "key",
              placeholder: "Enter role name",
              props: (options: FunctionArgumentType) => ({
                disabled:
                  !options.data.id.startsWith("-") &&
                  Object.values(SYSTEM_ROLES).includes(options.data.P.key),
              }),
              validation: { required: true },
            },
          ],
          class: SETTINGS_CONSTANTS.GRID_ITEM_CLASS,
          componentName: "Html",
        },
        {
          as: "div",
          attributes: [
            {
              as: "span",
              class: SETTINGS_CONSTANTS.LABEL_CLASS,
              componentName: "Html",
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
          componentName: "Html",
        },
      ],
      class: SETTINGS_CONSTANTS.FORM_CLASS,
      componentName: "Html",
    },
    {
      attributes: [
        {
          as: "div",
          attributes: [
            {
              as: "button",
              class: "cursor:pointer p:8|16 ",
              componentName: "Html",
              props: (options: FunctionArgumentType) => {
                const permissions = evalExpression("->RolePerm", {
                  graph: options.graph,
                  setGraph: options.setGraph,
                  vertexes: [options.data],
                });
                return {
                  class:
                    options.dataContext.tabState[0]?.activeTab === "Perm"
                      ? "bb:2px|solid|primary"
                      : "bb:2px|solid|transparent",
                  onClick: () =>
                    options.dataContext.tabState[1]("activeTab", "Perm"),
                  text: `Permissions ${options.dataContext.modalState[0]?.isLoading ? "" : `(${(permissions || []).length})`}`,
                };
              },
              type: "button",
            },
            {
              as: "button",
              class: "cursor:pointer p:8|16 ",
              componentName: "Html",
              props: (options: FunctionArgumentType) => {
                const permissions = evalExpression("->RolePage", {
                  graph: options.graph,
                  setGraph: options.setGraph,
                  vertexes: [options.data],
                });
                return {
                  class:
                    options.dataContext.tabState[0]?.activeTab === "Page"
                      ? "bb:2px|solid|primary"
                      : "bb:2px|solid|transparent",
                  onClick: () =>
                    options.dataContext.tabState[1]("activeTab", "Page"),
                  text: `Pages ${options.dataContext.modalState[0]?.isLoading ? "" : `(${(permissions || []).length})`}`,
                };
              },
              type: "button",
            },
            {
              as: "button",
              class: "cursor:pointer p:8|16 ",
              componentName: "Html",
              props: (options: FunctionArgumentType) => {
                const permissions = evalExpression("->RoleForm", {
                  graph: options.graph,
                  setGraph: options.setGraph,
                  vertexes: [options.data],
                });
                return {
                  class:
                    options.dataContext.tabState[0]?.activeTab === "Form"
                      ? "bb:2px|solid|primary"
                      : "bb:2px|solid|transparent",
                  onClick: () =>
                    options.dataContext.tabState[1]("activeTab", "Form"),
                  text: `Forms ${options.dataContext.modalState[0]?.isLoading ? "" : `(${(permissions || []).length})`}`,
                };
              },
              type: "button",
            },
          ],
          class: "display:flex bb:1px|solid|base-20",
          componentName: "Html",
        },
        {
          as: "div",
          attributes: [
            {
              as: "div",
              attributes: [permissionsTableSchema("Perm")],
              componentName: "Html",
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
              componentName: "Html",
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
              componentName: "Html",
              props: (options: FunctionArgumentType) => ({
                class:
                  options.dataContext.tabState[0]?.activeTab === "Form"
                    ? ""
                    : "d:none",
              }),
            },
          ],
          class: "mt:16 p:8",
          componentName: "Html",
        },
      ],
      componentName: "Data",
      name: "tabState",

      props: () => ({
        data: createStore({
          activeTab: "Perm",
        }),
      }),
    },
  ],
  componentName: "Html",
  props: (options: FunctionArgumentType) => {
    return {
      onMount: async () => {
        if (!options.data.id.startsWith("-")) {
          try {
            options.dataContext.modalState[1]("isLoading", true);
            const response = await postAPI(API.role.getRoleUrl, {
              id: options.data.id,
            });
            if (response.error) {
              throw new Error(response.error);
            }
            options.setGraphData(0, response.graph, {});
          } catch (error) {
            options.showErrorToast((error as Error).message);
          } finally {
            options.dataContext.modalState[1]("isLoading", false);
          }
        }
      },
      onUnmount: () => {
        options.revertTransactionUpToIndex(options.txnId, -1);
      },
    };
  },
};

export const getRoleFormSchema = (onSuccess: () => void) => {
  const { showErrorToast, showSuccessToast } = useToast();

  const validateForm = (formData: Vertex) => {
    if (!formData.P.key?.trim()) {
      showErrorToast("Please enter role name");
      return false;
    }
    return true;
  };

  const handleSave = async (options: FunctionArgumentType) => {
    const formData = options.data;
    if (!validateForm(formData)) {
      return;
    }

    try {
      options.dataContext.modalState[1]("isLoading", true);
      const data = commitTxn(options.txnId, options.graph);
      if (!data) {
        return;
      }
      const response = await postAPI(API.role.upsertRoleUrl, {
        data,
        role: formData,
      });

      if (response.error) {
        showErrorToast(response.error);
      } else {
        onMutatDataGet(
          options.graph,
          options.setGraph,
          response as MutationResult,
        );
        showSuccessToast("Role created successfully");
        onSuccess();
      }
    } catch (error) {
      showErrorToast((error as Error).message);
    } finally {
      options.dataContext.modalState[1]("isLoading", false);
    }
  };

  // Modal schemas similar to SubDomainForm
  const modalHeaderSchema = {
    as: "div",
    attributes: [
      {
        as: "span",
        class: SETTINGS_CONSTANTS.MODAL.HEADER.TEXT_CLASS,
        componentName: "Html",
        text: "Add New Role",
      },
    ],
    class: SETTINGS_CONSTANTS.MODAL.HEADER.CLASS,
    componentName: "Html",
  };

  const modalFooterSchema = {
    as: "div",
    attributes: [
      {
        as: "button",
        class: SETTINGS_CONSTANTS.MODAL.BUTTONS.SAVE_CLASS,
        componentName: "Html",
        props: (options: FunctionArgumentType) => ({
          disabled: options.dataContext.modalState[0]?.isLoading,
          onClick: () => handleSave(options),
          text: options.dataContext.modalState[0]?.isLoading
            ? "Saving..."
            : "Save",
        }),
        type: "button",
      },
      {
        as: "button",
        class: SETTINGS_CONSTANTS.MODAL.BUTTONS.CANCEL_CLASS,
        componentName: "Html",
        props: (options: FunctionArgumentType) => ({
          onClick: () => {
            options.dataContext.modalState[1]("showModal", false);
          },
          text: "Cancel",
        }),
        type: "button",
      },
    ],
    class: SETTINGS_CONSTANTS.MODAL.FOOTER.CLASS,
    componentName: "Html",
  };

  const schema = {
    attributes: [
      {
        as: "div",
        attributes: [
          addEditButtonSchema("Role"),
          {
            as: "div",
            attributes: [],
            class: SETTINGS_CONSTANTS.MODAL.OVERLAY_CLASS,
            componentName: "Html",
            props: (options: FunctionArgumentType) => ({
              hidden: !options.dataContext.modalState[0]?.showModal,
            }),
          },
          {
            attributes: [
              {
                attributes: [
                  {
                    as: "dialog",
                    attributes: [
                      {
                        attributes: [
                          modalHeaderSchema,
                          roleFormSchema,
                          modalFooterSchema,
                        ],
                        componentName: "Form",
                        props: (options: FunctionArgumentType) => ({
                          formDataId: options.data.id,
                        }),
                      },
                    ],
                    class: SETTINGS_CONSTANTS.MODAL.CONTAINER_CLASS,
                    componentName: "Html",
                    open: true,
                    props: (options: FunctionArgumentType) => ({
                      style: {
                        "z-index": options.zIndex + 1,
                      },
                    }),
                  },
                ],
                componentName: "Portal",
                props: (options: FunctionArgumentType) => ({
                  hidden: !options.dataContext.modalState[0]?.showModal,
                }),
              },
            ],
            componentName: "ZIndex",
          },
        ],
        componentName: "Html",
      },
    ],
    componentName: "Data",
    name: "modalState",

    props: () => ({
      data: createStore({
        isLoading: false,
        showModal: false,
      }),
      // TODO: if not saved, revert to previous state
      // onUnmount: () => {
      //   options.revertTransactionUpToIndex(options.txnId, -1);
      // }
    }),
  };

  return { attributes: [schema], key: "Role" } as IFormMetaData;
};
