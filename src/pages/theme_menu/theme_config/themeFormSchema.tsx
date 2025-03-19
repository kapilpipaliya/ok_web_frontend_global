import { createSignal } from "solid-js";
import { createStore } from "solid-js/store";

import type { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";
import type { IFormMetaData } from "~/lib/meta/FormMetadataType";

import { MonacoEditorWrapper } from "~/components/styled/MonacoEditorWrapper";
import { useToast } from "~/components/styled/Toast";
import { getErrorMessage } from "~/lib/api/general/getErrorMessage";
import { submitDataCall } from "~/lib/api/service/data/submitDataCall";
import { formatJavaScriptCode } from "~/lib/data_structure/string/formatUtils";
import { useGraph } from "~/lib/graph/GraphContext";
import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex";
import { createFormVertex } from "~/lib/graph/mutate/form/createForm";
import { commitTxn } from "~/lib/graph/transaction/core/commitTxn";
import { generateNewTxnId } from "~/lib/graph/transaction/core/generateNewTxnId";
import { createActiveClickOutside } from "~/lib/hooks/createActiveClickOutside";
import { validateFunction } from "~/lib/validation/validateFunction";
import { PROPERTIES, SETTINGS_CONSTANTS } from "~/pages/settings/constants";

export const themeFormSchema = {
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
              text: "Theme Name",
              validation: { required: true },
            },
            {
              class: PROPERTIES.Css.TextField,
              componentName: "TextInput",
              key: "key",
              placeholder: "Enter theme name",
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
              text: "Theme Configuration",
              validation: { required: true },
            },
            {
              key: "data",
              props: (options: FunctionArgumentType) => ({
                componentName: (props: any) => (
                  <MonacoEditorWrapper
                    height="400px"
                    language="javascript"
                    {...props}
                    onChange={(value) =>
                      options.dataContext.modalState[1]("editorData", value)
                    }
                    onMount={(_monaco, editor) =>
                      options.dataContext.editorState[1](editor)
                    }
                    value={options.dataContext.modalState[0]?.editorData}
                  />
                ),
              }),
            },
            {
              as: "div",
              attributes: [
                {
                  as: "button",
                  class: "px:5 py:5 bg:gray-60 fg:base-5 r:5",
                  componentName: "Html",
                  props: (options: FunctionArgumentType) => ({
                    onClick: async () => {
                      const editor = options.dataContext?.editorState[0]();
                      if (editor) {
                        try {
                          const formatted = await formatJavaScriptCode(
                            editor.getValue(),
                          );
                          editor.setValue(formatted);
                        } catch (err) {
                          console.error("Formatting failed:", err);
                          options.showWarningToast("Failed to format code");
                        }
                      }
                    },
                  }),
                  text: "Format",
                  type: "button",
                },
              ],
              class: "flex ai:center gap:0.50rem",
              componentName: "Html",
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

export const getThemeFormSchema = (
  onSuccess: () => void,
  onClose: () => void,
) => {
  const { showErrorToast, showSuccessToast, showWarningToast } = useToast();
  const [graph, setGraph] = useGraph();

  createActiveClickOutside(graph, setGraph);

  const validateForm = (options: FunctionArgumentType) => {
    const formData = options.data;
    if (!formData.P.key?.trim() && formData.id.startsWith("-")) {
      showErrorToast("Please enter theme name");
      return false;
    }

    const editorData = options.dataContext.modalState[0]?.editorData?.trim();
    if (!editorData) {
      showErrorToast("Please enter theme configuration");
      return false;
    }

    const validation = validateFunction(editorData);
    if (!validation.isValid) {
      showErrorToast(validation.error || "Invalid theme configuration");
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

      const newFormTxnId = generateNewTxnId(graph, setGraph);
      let result;

      if (formData.id.startsWith("-")) {
        // Create new theme
        result = createFormVertex(graph, setGraph, newFormTxnId, "Theme", {
          data: options.dataContext.modalState[0]?.editorData,
          key: formData.P.key,
        });
      } else {
        // Update existing theme
        result = mergeVertexProperties(
          newFormTxnId,
          formData.id,
          graph,
          setGraph,
          { data: options.dataContext.modalState[0]?.editorData },
        );
      }

      if (result.error) {
        showErrorToast(result.error as string);
        return;
      }

      const data = commitTxn(newFormTxnId, graph);
      if (!data) {
        showWarningToast("Internal Server Error");
        return;
      }

      try {
        await submitDataCall({ ...data }, graph, setGraph, newFormTxnId);
        // we not need to ensure data here, because clicking on Add new Theme will create a new form..
        // options.removeTxnIdAndCreateNew(options.txnId);
        // options.ensureData();
        showSuccessToast("Theme Saved Successfully");
        options.dataContext.modalState[1]("showModal", false);
        onSuccess();
      } catch (er) {
        showErrorToast(getErrorMessage(er));
      }
    } catch (error) {
      showErrorToast((error as Error).message);
    } finally {
      options.dataContext.modalState[1]("isLoading", false);
    }
  };

  // Modal schemas
  const modalHeaderSchema = {
    as: "div",
    attributes: [
      {
        as: "span",
        class: SETTINGS_CONSTANTS.MODAL.HEADER.TEXT_CLASS,
        componentName: "Html",
        props: (options: FunctionArgumentType) => {
          return {
            text:
              options.data?.id && !options.data?.id.startsWith("-")
                ? `Configure Theme [${options.data?.P.key}]`
                : "Add New Theme",
          };
        },
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
                          themeFormSchema,
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

    props: (options: FunctionArgumentType) => ({
      data: createStore({
        editorData: options.data?.P.data ?? "",
        isLoading: false,
        showModal: true,
      }),
    }),
  };

  return {
    attributes: [
      {
        attributes: [schema],
        componentName: "Data",
        name: "editorState",

        props: () => ({
          data: createSignal(),
        }),
      },
    ],
    key: "Theme",
  } as IFormMetaData;
};
