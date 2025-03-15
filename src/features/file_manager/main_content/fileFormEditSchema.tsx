import { createStore } from "solid-js/store";

import type { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";
import type {
  FieldAttribute,
  IFormMetaData,
} from "~/lib/meta/FormMetadataType";

import { useToast } from "~/components/styled/Toast";
import { submitDataCall } from "~/lib/api/service/data/submitDataCall";
import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex";
import { commitTxn } from "~/lib/graph/transaction/core/commitTxn";
import { generateNewTxnId } from "~/lib/graph/transaction/core/generateNewTxnId";
import { PROPERTIES, SETTINGS_CONSTANTS } from "~/pages/settings/constants";
import { addEditButtonSchema } from "~/pages/subdomain/functions/addEditButtonSchema";

import { useFileManagerStore } from "../FileManagerContext";

const editFormSchema = {
  as: "div",
  attributes: [
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
              key: "fileName",
              placeholder: "Enter name",
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
              componentName: "TextArea",
              key: "description",
              placeholder: "Enter description",
            },
          ],
          class: SETTINGS_CONSTANTS.GRID_ITEM_CLASS,
          componentName: "Html",
        },
      ],
      class: SETTINGS_CONSTANTS.FORM_CLASS,
      componentName: "Html",
    },
  ],
  componentName: "Html",
} as FieldAttribute;

export const getEditFileOrFolderSchema = (onSuccess: () => void) => {
  const { showErrorToast, showSuccessToast } = useToast();
  const [fileManagerStore] = useFileManagerStore();

  const validateForm = (options: FunctionArgumentType) => {
    const formData = options.data;
    if (!formData.P.fileName?.trim()) {
      showErrorToast("Please enter name");
      return false;
    }
    return true;
  };

  const handleSave = async (options: FunctionArgumentType) => {
    if (!validateForm(options)) {
      return;
    }
    const formData = options.data;

    try {
      options.dataContext.modalState[1]("isLoading", true);

      //   const currentItem = fileManagerStore.selectedItem;
      //   if (!currentItem) {
      //     showErrorToast("No item selected");
      //     return;
      //   }

      const newFormTxnId = generateNewTxnId(options.graph, options.setGraph);

      // Update the vertex properties
      mergeVertexProperties(
        newFormTxnId,
        formData.id,
        options.graph,
        options.setGraph,
        {
          description: formData.P.description,
          fileName: formData.P.fileName,
        },
      );

      const commitData = commitTxn(newFormTxnId, options.graph);

      if (!commitData) {
        showErrorToast("Failed to commit transaction");
        return;
      }

      const isSuccess = await submitDataCall(
        { ...commitData },
        options.graph,
        options.setGraph,
        newFormTxnId,
      );

      if (isSuccess) {
        showSuccessToast("Item updated successfully");
        fileManagerStore.gridStore?.[0].fetchTableData();
        onSuccess();
      } else {
        showErrorToast("Failed to update item");
      }
    } catch (error) {
      console.error("Error updating item:", error);
      showErrorToast("Failed to update item");
    } finally {
      options.dataContext.modalState[1]("isLoading", false);
      options.dataContext.modalState[1]("showModal", false);
    }
  };

  const modalHeaderSchema = {
    as: "div",
    attributes: [
      {
        as: "span",
        class: SETTINGS_CONSTANTS.MODAL.HEADER.TEXT_CLASS,
        componentName: "Html",
        text: "Edit Item",
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
          addEditButtonSchema("Edit"),
          {
            attributes: [
              {
                attributes: [
                  {
                    as: "div",
                    attributes: [],
                    class: SETTINGS_CONSTANTS.MODAL.OVERLAY_CLASS,
                    componentName: "Html",
                    props: (options: FunctionArgumentType) => ({
                      hidden: !options.dataContext.modalState[0]?.showModal,
                      style: {
                        "z-index": options.zIndex,
                      },
                    }),
                  },
                  {
                    as: "dialog",
                    attributes: [
                      modalHeaderSchema,
                      editFormSchema,
                      modalFooterSchema,
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
    }),
  };

  return { attributes: [schema], key: "Edit" } as IFormMetaData;
};
