import { createStore } from "solid-js/store";

import type { FunctionArgumentType } from "~/components/form/FieldSchemaType";
import type { Vertex } from "~/lib/graph/graph";
import type {
  FieldAttribute,
  IFormMetaData,
} from "~/lib/meta/FormMetadataType";

import { useToast } from "~/components/styled/Toast";
import { API } from "~/lib/api/endpoints";
import { postAPI } from "~/lib/api/postApi";
import { PROPERTIES, SETTINGS_CONSTANTS } from "~/pages/settings/constants";
import { addEditButtonSchema } from "~/pages/subdomain/functions/addEditButtonSchema";

export function getActivityLogFormSchema(onSuccess: () => void) {
  const { showErrorToast, showSuccessToast } = useToast();
  const validateForm = (formData: Vertex) => {
    if (!formData.P.action?.trim()) {
      showErrorToast("Please enter action");
      return false;
    }
    if (!formData.P.entityType?.trim()) {
      showErrorToast("Please enter entity type");
      return false;
    }
    if (!formData.P.entityId?.trim()) {
      showErrorToast("Please enter entity ID");
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
      const url = formData.id.startsWith("-")
        ? API.settings.activity.createUrl
        : API.settings.activity.updateUrl;
      const payload = {
        action: formData.P.action,
        description: formData.P.description,
        entityId: formData.P.entityId,
        entityType: formData.P.entityType,
        user: formData.P.user,
      };

      if (!formData.id.startsWith("-")) {
        payload.id = formData.id;
      }

      const response = await postAPI(url, payload);

      if (response.error) {
        showErrorToast(response.error);
      } else {
        showSuccessToast(
          formData.id.startsWith("-")
            ? "Activity log created successfully"
            : "Activity log updated successfully",
        );
        onSuccess();
      }
    } catch (error) {
      showErrorToast((error as Error).message);
    } finally {
      options.dataContext.modalState[1]("isLoading", false);
    }
  };

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
                text: "Action",
                validation: { required: true },
              },
              {
                class: PROPERTIES.Css.TextField,
                componentName: "TextInput",
                key: "action",
                placeholder: "Enter action",
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
                text: "Entity Type",
                validation: { required: true },
              },
              {
                class: PROPERTIES.Css.TextField,
                componentName: "TextInput",
                key: "entityType",
                placeholder: "Enter entity type",
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
                text: "Entity ID",
                validation: { required: true },
              },
              {
                class: PROPERTIES.Css.TextField,
                componentName: "TextInput",
                key: "entityId",
                placeholder: "Enter entity ID",
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
                text: "User",
              },
              {
                class: PROPERTIES.Css.TextField,
                componentName: "TextInput",
                key: "user",
                placeholder: "Enter user",
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
                placeholder: "Enter description",
              },
            ],
            class: SETTINGS_CONSTANTS.GRID_ITEM_CLASS,
            componentName: "Box",
          },
        ],
        class: SETTINGS_CONSTANTS.FORM_CLASS,
        componentName: "Box",
      },
    ],
    componentName: "Box",
  };

  const modalHeaderSchema = {
    as: "div",
    attributes: [
      {
        class: SETTINGS_CONSTANTS.MODAL.HEADER.TEXT_CLASS,
        componentName: "Text",
        text: "Add New Activity Log",
      },
    ],
    class: SETTINGS_CONSTANTS.MODAL.HEADER.CLASS,
    componentName: "Box",
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
    componentName: "Box",
  };

  const schema: FieldAttribute = {
    attributes: [
      {
        as: "div",
        attributes: [
          addEditButtonSchema("ActivityLog"),
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
                attributes: [
                  {
                    attributes: [
                      modalHeaderSchema,
                      formSchema,
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
                  hidden: !options.dataContext.modalState[0]?.showModal,
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
        componentName: "Box",
      },
    ],
    componentName: "Data",
    name: "modalState",
    
    props: () => ({
      data: createStore({
        isLoading: false,
        showModal: false,
      }),
    }),
  };

  return { attributes: [schema], key: "ActivityLog" } as IFormMetaData;
}
