import { createStore } from "solid-js/store";

import type { FunctionArgumentType } from "~/components/form/FieldSchemaType";
import type { Vertex } from "~/lib/graph/graph";
import type {
  FieldAttribute,
  IFormMetaData,
} from "~/lib/meta/FormMetadataType";

import { PROPERTIES } from "~/components/styled/constants/constant";
import { useToast } from "~/components/styled/Toast";
import { API } from "~/lib/api/endpoints";
import { postAPI } from "~/lib/api/postApi";

import { SETTINGS_CONSTANTS } from "../settings/constants";

export function getSubDomainFormSchema(onSuccess: () => void) {
  const { showErrorToast, showSuccessToast } = useToast();
  const validateForm = (formData: Vertex) => {
    if (!formData.P.key?.trim()) {
      showErrorToast("Please enter subdomain name");
      return false;
    }
    if (!formData.P.domain?.trim()) {
      showErrorToast("Please enter domain");
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
      const response = await postAPI(API.subdomain.createUrl, {
        domain: formData.P.domain,
        key: formData.P.key,
      });

      if (response.error) {
        showErrorToast(response.error);
      } else {
        showSuccessToast("Subdomain created successfully");
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
                text: "Name",
                validation: { required: true },
              },
              {
                class: PROPERTIES.Css.TextField,
                componentName: "TextInput",
                key: "key",
                placeholder: "Enter subdomain name",
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
                text: "Domain",
                validation: { required: true },
              },
              {
                class: PROPERTIES.Css.TextField,
                componentName: "TextInput",
                key: "domain",
                placeholder: "Enter domain (Optional) eg: example.com",
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
        text: "Add New SubDomain",
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

  const schema: FieldAttribute = {
    attributes: [
      {
        as: "div",
        attributes: [
          {
            attributes: [
              {
                attributes: [
                  {
                    class: SETTINGS_CONSTANTS.MODAL.BUTTONS.SAVE_CLASS,
                    componentName: "Button",
                    props: (options: FunctionArgumentType) => ({
                      onClick: () => {
                        options.dataContext.modalState[1]("showModal", true);
                      },
                      text: "Add New SubDomain",
                    }),
                  },
                ],
                componentName: "Show",
                props: (options: FunctionArgumentType) => ({
                  when: options.data?.id?.startsWith("-"),
                }),
              },
              {
                attributes: [
                  {
                    attributes: [
                      {
                        componentName: "Icon",
                        height: 20,
                        icon: "ph:pencil",
                        width: 20,
                      },
                    ],
                    class: "flex ai:center",
                    componentName: "Button",
                    props: (options: FunctionArgumentType) => ({
                      onClick: () => {
                        options.dataContext.modalState[1]("showModal", true);
                      },
                    }),
                  },
                ],
                componentName: "Show",
                props: (options: FunctionArgumentType) => ({
                  when: !options.data?.id?.startsWith("-"),
                }),
              },
            ],
            componentName: "Fragment",
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

  return { attributes: [schema], key: "SubDomain" } as IFormMetaData;
}
