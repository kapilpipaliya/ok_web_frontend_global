import type { Component } from "solid-js";

import { createStore } from "solid-js/store";
import { v7 as uuidv7 } from "uuid";

import type { FunctionArgumentType } from "~/components/form/FieldSchemaType";

import { useToast } from "~/components/styled/Toast";
import { API } from "~/lib/api/endpoints";
import { postAPI } from "~/lib/api/postApi";
import { useGraph, type Vertex } from "~/lib/graph/graph";
import { addNewVertex } from "~/lib/graph/mutate/vertex";

import { SchemaRenderer } from "../../SchemaRenderer";
import { SETTINGS_CONSTANTS } from "../../settings/constants";
import { formSchema } from "./formSchema";

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
    if (!validateForm(formData)) {
      return;
    }

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

  // Modal schemas similar to SubDomainForm
  const modalHeaderSchema = {
    as: "div",
    attributes: [
      {
        class: SETTINGS_CONSTANTS.MODAL.HEADER.TEXT_CLASS,
        componentName: "Text",
        text: "Add New Role",
      },
    ],
    class: SETTINGS_CONSTANTS.MODAL.HEADER.CLASS,
    componentName: "Box",
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
          disabled: options.dataContext.modalState[0]?.isLoading,
          onClick: handleSave,
          text: options.dataContext.modalState[0]?.isLoading
            ? "Saving..."
            : "Save",
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
              hidden: !options.dataContext.modalState[0]?.showModal,
            }),
          },
          {
            attributes: [
              {
                as: "dialog",
                attributes: [modalHeaderSchema, formSchema, modalFooterSchema],
                class: SETTINGS_CONSTANTS.MODAL.CONTAINER_CLASS,
                componentName: "Html",
                open: true,
                props: (options: FunctionArgumentType) => ({
                  hidden: !options.dataContext.modalState[0]?.showModal,
                  style: {
                    "z-index": options.zIndex + 1,
                  },
                }),
              },
            ],
            componentName: "ZIndex",
          },
        ],
        componentName: "Box",
      },
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
