import { createStore as createSolidJsStore } from "solid-js/store";

import type { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";
import type { Vertex } from "~/lib/graph/graph";
import type {
  FieldAttribute,
  IFormMetaData,
} from "~/lib/meta/FormMetadataType";

import { useToast } from "~/components/styled/modal/Toast";
import { checkUniqueConstrains } from "~/cypher/mutate/validations/checkUniqueConstrains";
import { getErrorMessage } from "~/lib/api/general/getErrorMessage";
import { submitDataCall } from "~/lib/api/service/data/submitDataCall";
import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex";
import { createFormVertex } from "~/lib/graph/mutate/form/createForm";
import { setSelectionValue } from "~/lib/graph/mutate/selection/setSelectionValue";
import { commitTxn } from "~/lib/graph/transaction/core/commitTxn";
import { generateNewTxnId } from "~/lib/graph/transaction/core/generateNewTxnId";
import { parentCompAttribute, parentPermAttribute } from "~/lib/meta/base/Comp";
import { PROPERTIES, SETTINGS_CONSTANTS } from "~/pages/settings/constants";
import { addEditButtonSchema } from "~/pages/subdomain/functions/addEditButtonSchema";

import { useFileManagerStore } from "../FileManagerContext";

export const getComponentFormSchema = (
  onSuccess: () => void,
  onClose: () => void,
  saveAsLabel?: "Comp" | "Perm",
) => {
  const { showErrorToast, showSuccessToast } = useToast();
  const [fileManagerStore] = useFileManagerStore();
  const label = () => (saveAsLabel === "Perm" ? "Permission" : "Component");

  const validateForm = (formData: Vertex) => {
    if (!formData.P.key?.trim()) {
      showErrorToast(`Please enter ${label().toLowerCase()} name`);
      return false;
    }
    return true;
  };

  const handleSave = async (options: FunctionArgumentType) => {
    const formData = options.data;
    if (!validateForm(formData)) {
      return;
    }

    const res = await checkUniqueConstrains({
      L: [saveAsLabel || "Comp"],
      P: { key: formData.P.key },
    } as unknown as Vertex);
    if (res.error) {
      showErrorToast(res.error);
      return;
    }

    try {
      options.dataContext.modalState[1]("isLoading", true);

      const newFormTxnId = generateNewTxnId(options.graph, options.setGraph);
      const formVertex = formData;

      if (formData.id.startsWith("-")) {
        const createResult = createFormVertex(
          options.graph,
          options.setGraph,
          newFormTxnId,
          saveAsLabel || "Comp",
          {
            description: formVertex.P.description,
            key: formVertex.P.key,
          },
        );
        const dataVertex = createResult.vertex!;

        const parentFolderMetaVertex = {
          id: "",
          IN: {},
          L: [],
          OUT: {},
          P: saveAsLabel === "Perm" ? parentPermAttribute : parentCompAttribute,
        } as Vertex;

        setSelectionValue(
          newFormTxnId,
          dataVertex,
          options.graph,
          options.setGraph,
          parentFolderMetaVertex,
          fileManagerStore.selectedItem!.id,
        );
      } else {
        const updateResult = mergeVertexProperties(
          newFormTxnId,
          formData.id,
          options.graph,
          options.setGraph,
          {
            description: formVertex.P.description,
            key: formVertex.P.key,
          },
        );

        if (updateResult.error) {
          showErrorToast(updateResult.error);
          return;
        }
      }

      const commitData = commitTxn(newFormTxnId, options.graph);

      if (!commitData) {
        showErrorToast(`Failed to upload ${label()}`);
        return;
      }

      const result = await submitDataCall(
        { ...commitData },
        options.graph,
        options.setGraph,
        newFormTxnId,
      );

      if (getErrorMessage(result)) {
        showErrorToast(getErrorMessage(result));
      } else {
        // options.removeTxnIdAndCreateNew(options.txnId);
        // as we are creating new transaction, we need to revert to previous state
        options.revertTransactionUpToIndex(options.txnId, -1);
        options.ensureData();
        showSuccessToast(`${label()} created successfully`);
        options.dataContext.modalState[1]("showModal", false);
        fileManagerStore.gridStore?.[0].fetchTableData();
        onSuccess();
      }
    } catch (error) {
      showErrorToast((error as Error).message);
    } finally {
      options.dataContext.modalState[1]("isLoading", false);
    }
  };

  const modalHeaderSchema = {
    as: "div",
    attributes: [
      {
        as: "span",
        class: SETTINGS_CONSTANTS.MODAL.HEADER.TEXT_CLASS,
        componentName: "Html",
        text: `Add New ${label()}`,
      },
    ],
    class: SETTINGS_CONSTANTS.MODAL.HEADER.CLASS,
    componentName: "Html",
  };

  const componentFormSchema = {
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
                text: `${label()} Name`,
                validation: { required: true },
              },
              {
                class: PROPERTIES.Css.TextField,
                componentName: "TextInput",
                key: "key",
                placeholder: `Enter ${label().toLowerCase()} name`,
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
          disabled: options.dataContext.modalState[0]?.isLoading,
          onClick: () => {
            options.dataContext.modalState[1]("showModal", false);
            options.revertTransactionUpToIndex(options.txnId, -1);
            onClose();
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
          addEditButtonSchema(saveAsLabel || "Comp"),
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
                      hide: !options.dataContext.modalState[0]?.showModal,
                      style: {
                        "z-index": options.zIndex,
                      },
                    }),
                  },
                  {
                    as: "dialog",
                    attributes: [
                      {
                        attributes: [
                          modalHeaderSchema,
                          componentFormSchema,
                          modalFooterSchema,
                        ],
                        componentName: "Html",
                        props: (options: FunctionArgumentType) => ({
                          formDataId: options.data?.id,
                        }),
                      },
                    ],
                    class: SETTINGS_CONSTANTS.MODAL.CONTAINER_CLASS,
                    componentName: "Html",
                    open: true,
                    props: (options: FunctionArgumentType) => ({
                      onClick: (event: MouseEvent) => {
                        event.stopPropagation();
                      },
                      style: {
                        "z-index": options.zIndex + 1,
                      },
                    }),
                  },
                ],
                componentName: "Portal",
                props: (options: FunctionArgumentType) => ({
                  hide: !options.dataContext.modalState[0]?.showModal,
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
      data: createSolidJsStore({
        isLoading: false,
        showModal: false,
      }),
    }),
  };

  return { attributes: [schema], key: saveAsLabel || "Comp" } as IFormMetaData;
};
