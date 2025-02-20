import { type Component } from "solid-js";
import { createStore } from "solid-js/store";
import { v7 as uuidv7 } from "uuid";

import { FunctionArgumentType } from "~/components/form/FieldSchemaType";
import { PROPERTIES } from "~/components/styled/constants/constant";
import { useToast } from "~/components/styled/Toast";
import { API } from "~/lib/api/endpoints";
import { postAPI } from "~/lib/api/postApi";
import { useGraph, Vertex } from "~/lib/graph/graph";
import { addNewVertex } from "~/lib/graph/mutate/vertex";
import { FieldAttribute } from "~/lib/meta/FormMetadataType";

import { SchemaRenderer } from "../SchemaRenderer";
import { SETTINGS_CONSTANTS } from "../settings/constants";

interface Props {
  onSuccess: () => void;
}

export const AddRoleForm: Component<Props> = (props) => {
  const [graph, setGraph] = useGraph();
  const { showErrorToast, showSuccessToast } = useToast();
  const formDataId = uuidv7();

  addNewVertex(
    0,
    {
      id: formDataId,
      IN: {},
      L: ["Role"],
      OUT: {},
      P: {},
    },
    graph,
    setGraph,
  );

  const validateForm = (formData: Vertex) => {
    if (!formData.P.key?.trim()) {
      showErrorToast("Please enter role name");
      return false;
    }
    return true;
  };

  const handleSave = async (options: FunctionArgumentType) => {
    const formData = graph.vertexes[formDataId];
    if (!validateForm(formData)) return;

    try {
      options.dataContext.modalState[1]("isLoading", true);
      const response = await postAPI(API.role.createRoleUrl, {
        description: formData.P.description,
        key: formData.P.key,
        permissions: formData.P.permissions,
      });

      if (response.error) {
        showErrorToast(response.error);
      } else {
        showSuccessToast("Role created successfully");
        props.onSuccess();
      }
    } catch (error) {
      showErrorToast((error as Error).message);
    } finally {
      options.dataContext.modalState[1]("isLoading", false);
    }
  };

  const permissionsTableSchema = (label: string) => ({
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
  } as FieldAttribute);

  const formSchema = {
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
                  class: options.dataContext.tabState[0]?.activeTab === "Perm" ? "bb:2px|solid|primary" : "bb:2px|solid|transparent",
                  onClick: () => options.dataContext.tabState[1]("activeTab", "Perm"),
                  text: "Permissions"
                })
              },
              {
                class: "cursor:pointer p:8|16 ",
                componentName: "Button", 
                props: (options: FunctionArgumentType) => ({
                  class: options.dataContext.tabState[0]?.activeTab === "Page" ? "bb:2px|solid|primary" : "bb:2px|solid|transparent",
                  onClick: () => options.dataContext.tabState[1]("activeTab", "Page"),
                  text: "Pages"
                })
              },
              {
                class: "cursor:pointer p:8|16 ",
                componentName: "Button",
                props: (options: FunctionArgumentType) => ({
                  class: options.dataContext.tabState[0]?.activeTab === "Form" ? "bb:2px|solid|primary" : "bb:2px|solid|transparent",
                  onClick: () => options.dataContext.tabState[1]("activeTab", "Form"),
                  text: "Forms"
                })
              }
            ],
            class: "display:flex bb:1px|solid|base-20",
            componentName: "Box"
          },
          {
            as: "div",
            attributes: [
              {
                as: "div",
                attributes: [permissionsTableSchema("Perm")],
                componentName: "Box",
                props: (options: FunctionArgumentType) => ({
                  class: options.dataContext.tabState[0]?.activeTab === "Perm" ? "" : "d:none"
                }),
              },
              {
                as: "div",
                attributes: [permissionsTableSchema("Page")],
                componentName: "Box",
                props: (options: FunctionArgumentType) => ({
                  class: options.dataContext.tabState[0]?.activeTab === "Page" ? "" : "d:none"
                })
              },
              {
                as: "div",
                attributes: [permissionsTableSchema("Form")],
                componentName: "Box",
                props: (options: FunctionArgumentType) => ({
                  class: options.dataContext.tabState[0]?.activeTab === "Form" ? "" : "d:none"
                })
              }
            ],
            class: "mt:16",
            componentName: "Box"
          }
        ],
        componentName: "Data",
        name: "tabState",
        noRepeat: true,
        props: () => ({
          data: createStore({
            activeTab: "Perm"
          })
        })
      },
    ],
    componentName: "Box",
  };

  // Modal schemas similar to SubDomainForm
  const modalHeaderSchema = {
    as: "div",
    attributes: [
      {
        class: SETTINGS_CONSTANTS.MODAL.HEADER.TEXT_CLASS,
        componentName: "Text",
        text: "Add New Role",
      }
    ],
    class: SETTINGS_CONSTANTS.MODAL.HEADER.CLASS,
    componentName: "Box"
  };

  const modalFooterSchema = {
    as: "div",
    attributes: [
      {
        class: SETTINGS_CONSTANTS.MODAL.BUTTONS.CANCEL_CLASS,
        componentName: "Button",
        props: (options: FunctionArgumentType) => ({
          onClick: () => {
            options.dataContext.modalState[1]("showModal", false);
          },
          text: "Cancel",
        }),
      },
      {
        class: SETTINGS_CONSTANTS.MODAL.BUTTONS.SAVE_CLASS,
        componentName: "Button",
        props: (options: FunctionArgumentType) => ({
          disabled: options.dataContext.modalState[0]?.["isLoading"],
          onClick: handleSave,
          text: options.dataContext.modalState[0]?.["isLoading"] ? "Saving..." : "Save",
        }),
      },
    ],
    class: SETTINGS_CONSTANTS.MODAL.FOOTER.CLASS,
    componentName: "Box",
  };

  const schema = {
    attributes: [
      {
        as: "div",
        attributes: [
          {
            class: SETTINGS_CONSTANTS.MODAL.BUTTONS.SAVE_CLASS,
            componentName: "Button",
            props: (options: FunctionArgumentType) => ({
              onClick: () => {
                options.dataContext.modalState[1]("showModal", true);
              },
              text: "Add New Role",
            }),
          },
          {
            as: "div",
            attributes: [],
            class: SETTINGS_CONSTANTS.MODAL.OVERLAY_CLASS,
            componentName: "Box",
            props: (options: FunctionArgumentType) => ({
              hidden: !options.dataContext.modalState[0]?.["showModal"],
            }),
          },
          {
            attributes: [
              {
                as: "dialog",
                attributes: [
                  modalHeaderSchema,
                  formSchema,
                  modalFooterSchema,
                ],
                class: SETTINGS_CONSTANTS.MODAL.CONTAINER_CLASS,
                componentName: "Html",
                open: true,
                props: (options: FunctionArgumentType) => ({
                  hidden: !options.dataContext.modalState[0]?.["showModal"],
                  style: {
                    'z-index': options.zIndex + 1,
                  },
                }),
              },
            ],
            componentName: "ZIndex",
          },
        ],
        componentName: "Box",
      }
    ],
    componentName: "Data",
    name: "modalState",
    noRepeat: true,
    props: () => ({
      data: createStore({
        isLoading: false,
        showModal: false,
      }),
    }),
  };

  return (
    <SchemaRenderer
      form={{ attributes: [schema], key: "Role" }}
      formDataId={formDataId}
    />
  );
}; 