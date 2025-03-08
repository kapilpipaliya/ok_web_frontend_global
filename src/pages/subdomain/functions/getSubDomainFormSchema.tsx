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

import { PROPERTIES, SETTINGS_CONSTANTS } from "../../settings/constants";
import { addEditButtonSchema } from "./addEditButtonSchema";
import { revertTransactionUpToIndex } from "~/lib/graph/transaction/revert/revertTransactionUpToIndex";
import { resetTransaction } from "~/lib/graph/transaction/revert/resetTransaction";
import { validateDatabaseName } from "~/lib/validation/validateDatabaseName";
export function getSubDomainFormSchema(onSuccess: () => void) {
  const { showErrorToast, showSuccessToast } = useToast();
  const validateForm = (formData: Vertex) => {
    if (!formData.P.key?.trim()) {
      showErrorToast("Please enter subdomain name");
      return false;
    }
    const databaseNameError = validateDatabaseName(formData.P.key);
    if (databaseNameError) {
      showErrorToast(databaseNameError);
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
        ? API.subdomain.createUrl
        : API.subdomain.updateUrl;
      const payload = {
        domain: formData.P.domain,
        key: formData.P.key,
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
            ? "Subdomain created successfully"
            : "Subdomain updated successfully",
        );
        resetTransaction(options.txnId, options.graph, options.setGraph);
        options.dataContext.modalState[1]("showModal", false);
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
                props: (options: FunctionArgumentType) => ({
                  disabled: !options.data.id.startsWith("-"),
                }),
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
            resetTransaction(options.txnId, options.graph, options.setGraph);
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
          addEditButtonSchema("SubDomain"),
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
      // TODO: if not saved, revert to previous state
      // onUnmount: () => {
      //   options.revertTransactionUpToIndex(options.txnId, -1);
      // }
    }),
  };

  return { attributes: [schema], key: "SubDomain" } as IFormMetaData;
}
