import { onMount } from "solid-js";
import { createStore } from "solid-js/store";
import { v7 as uuidv7 } from "uuid";

import type { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";

import { useToast } from "~/components/styled/modal/Toast";
import { getErrorSchema } from "~/lib/schema/getErrorSchema";

import { SchemaRenderer } from "../../SchemaRenderer";
import { PROPERTIES, SETTINGS_CONSTANTS } from "../../settings/constants";
import { getSetting, saveSetting } from "~/lib/api/client/settingsClient";
import { addNewVertex } from "~/lib/graph/mutate/core/vertex/addNewVertex";
import { replaceVertexProperties } from "~/lib/graph/mutate/core/vertex/replaceVertexProperties";
import { useGraph } from "~/lib/graph/context/UseGraph";

// Define types for state stores
type SaveStateStore = ReturnType<
  typeof createStore<{
    isLoading: boolean;
  }>
>;

// Define type for Razorpay settings data
interface RazorpaySettingsData {
  razorpayEnabled?: boolean;
  razorpayKeyId?: string;
  razorpayKeySecret?: string;
  razorpayWebhookSecret?: string;
  [key: string]: unknown;
}

// Extend FunctionArgumentType to include our contextData
interface RazorpaySettingsFunctionArgumentType extends FunctionArgumentType {
  contextData: {
    saveState: SaveStateStore;
    [key: string]: unknown;
  };
}

// Validation functions
const validateRequired = (value: string | undefined) => {
  if (!value || value.trim() === "") {
    return "This field is required";
  }
  return undefined;
};

// Validation function
const validateFormData = (data: RazorpaySettingsData) => {
  const errors: Record<string, string> = {};

  if (data.razorpayEnabled) {
    const keyIdError = validateRequired(data.razorpayKeyId);
    if (keyIdError) {
      errors.razorpayKeyId = keyIdError;
    }

    const keySecretError = validateRequired(data.razorpayKeySecret);
    if (keySecretError) {
      errors.razorpayKeySecret = keySecretError;
    }
  }

  return Object.keys(errors).length > 0 ? errors : null;
};

export function RazorpaySettings() {
  const [graph, setGraph] = useGraph();
  const { showErrorToast, showSuccessToast } = useToast();

  // Create a new vertex for form data
  const formDataId = uuidv7();
  addNewVertex(
    0,
    {
      id: formDataId,
      IN: {},
      L: ["RazorpaySettings"],
      OUT: {},
      P: {},
    },
    graph,
    setGraph,
  );

  const form = {
    as: "",
    attributes: [
      {
        as: "div",
        attributes: [
          {
            as: "h3",
            css: `return \`._id {
  font-size: 1.125rem;
  font-weight: 600;
  color: \${args.theme.var.color.text};
  margin-bottom: 0.5rem;
}\`;`,
            componentName: "Html",
            text: "Razorpay Payment Configuration",
          },
          {
            as: "p",
            css: `return \`._id {
  font-size: 0.875rem;
  color: \${args.theme.var.color.text_dark_300};
  margin-bottom: 1.5rem;
}\`;`,
            componentName: "Html",
            text: "Configure Razorpay to enable payment processing for subscriptions. Get your API keys from the Razorpay Dashboard.",
          },
          {
            as: "div",
            attributes: [
              {
                as: "span",
                css: SETTINGS_CONSTANTS.LABEL_CSS,
                componentName: "Html",
                text: "Enable Razorpay",
              },
              {
                componentName: "SystemTextInput",
                css: [PROPERTIES.Css.CheckBoxCss],
                key: "razorpayEnabled",
                type: "checkbox",
              },
            ],
            css: SETTINGS_CONSTANTS.GRID_ITEM_CSS,
            componentName: "Html",
          },
          getErrorSchema(
            "razorpayEnabled",
            "return `._id {color: ${args.theme.var.color.error}; margin-top: -20px;};`",
          ),
          {
            as: "div",
            attributes: [
              {
                as: "span",
                css: SETTINGS_CONSTANTS.LABEL_CSS,
                componentName: "Html",
                text: "Key ID",
              },
              {
                css: PROPERTIES.Css.TextFieldCss,
                componentName: "SystemTextInput",
                key: "razorpayKeyId",
                placeholder: "rzp_test_... or rzp_live_...",
                validate: (value: string, data: Record<string, unknown>) =>
                  data.P && (data.P as RazorpaySettingsData).razorpayEnabled
                    ? validateRequired(value)
                    : undefined,
              },
            ],
            css: SETTINGS_CONSTANTS.GRID_ITEM_CSS,
            componentName: "Html",
            props: (options: RazorpaySettingsFunctionArgumentType) => ({
              hide: () => !options.data?.P.razorpayEnabled,
            }),
          },
          getErrorSchema(
            "razorpayKeyId",
            "return `._id {color: ${args.theme.var.color.error}; margin-top: -20px;};`",
          ),
          {
            as: "div",
            attributes: [
              {
                as: "span",
                css: SETTINGS_CONSTANTS.LABEL_CSS,
                componentName: "Html",
                text: "Key Secret",
              },
              {
                css: PROPERTIES.Css.TextFieldCss,
                componentName: "SystemTextInput",
                key: "razorpayKeySecret",
                placeholder: "Enter your Razorpay Key Secret",
                type: "password",
                validate: (value: string, data: Record<string, unknown>) =>
                  data.P && (data.P as RazorpaySettingsData).razorpayEnabled
                    ? validateRequired(value)
                    : undefined,
              },
            ],
            css: SETTINGS_CONSTANTS.GRID_ITEM_CSS,
            componentName: "Html",
            props: (options: RazorpaySettingsFunctionArgumentType) => ({
              hide: () => !options.data?.P.razorpayEnabled,
            }),
          },
          getErrorSchema(
            "razorpayKeySecret",
            "return `._id {color: ${args.theme.var.color.error}; margin-top: -20px;};`",
          ),
          {
            as: "div",
            attributes: [
              {
                as: "span",
                css: SETTINGS_CONSTANTS.LABEL_CSS,
                componentName: "Html",
                text: "Webhook Secret (Optional)",
              },
              {
                css: PROPERTIES.Css.TextFieldCss,
                componentName: "SystemTextInput",
                key: "razorpayWebhookSecret",
                placeholder: "Enter webhook secret for payment verification",
                type: "password",
              },
            ],
            css: SETTINGS_CONSTANTS.GRID_ITEM_CSS,
            componentName: "Html",
            props: (options: RazorpaySettingsFunctionArgumentType) => ({
              hide: () => !options.data?.P.razorpayEnabled,
            }),
          },
          getErrorSchema(
            "razorpayWebhookSecret",
            "return `._id {color: ${args.theme.var.color.error}; margin-top: -20px;};`",
          ),
          {
            as: "div",
            attributes: [
              {
                attributes: [
                  {
                    as: "button",
                    css: SETTINGS_CONSTANTS.SAVE_BUTTON_CSS,
                    componentName: "Html",
                    props: (options: RazorpaySettingsFunctionArgumentType) => ({
                      disabled: options.contextData.saveState[0]?.isLoading,
                      onClick: async () => {
                        try {
                          options.contextData.saveState[1]("isLoading", true);
                          const settings = graph.vertexes[formDataId];

                          // Validate form data
                          const errors = validateFormData(
                            settings.P as RazorpaySettingsData,
                          );

                          if (errors) {
                            // Show validation errors
                            for (const fieldKey in errors) {
                              options.setError(errors[fieldKey], fieldKey);
                            }
                            showErrorToast("Please fix the validation errors");
                            return;
                          }

                          options.clearAllErrors();

                          // Use server function to save settings
                          const response = await saveSetting(
                            "razorpay",
                            settings.P as RazorpaySettingsData,
                          );

                          if (response.error) {
                            showErrorToast(
                              response.error ||
                                "Failed to save Razorpay settings",
                            );
                          } else {
                            showSuccessToast(
                              response.message ||
                                "Razorpay settings saved successfully",
                            );
                          }
                        } catch (error) {
                          showErrorToast((error as Error).message);
                        } finally {
                          options.contextData.saveState[1]("isLoading", false);
                        }
                      },
                      text: options.contextData.saveState[0]?.isLoading
                        ? "Saving..."
                        : "Save Changes",
                    }),
                  },
                ],
                componentName: "Html",
                contextName: "saveState",

                props: () => ({
                  data: createStore({
                    isLoading: false,
                  }),
                }),
              },
            ],
            css: `return \`._id {
  margin-top: 24px;
}\`;`,
            componentName: "Html",
          },
        ],
        css: SETTINGS_CONSTANTS.FORM_CSS,
        componentName: "Html",
      },
    ],
    componentName: "Html",
    props: (options: FunctionArgumentType) => ({
      onCleanup: () => {
        options.revertTransactionUpToIndex(options.txnId, -1);
      },
    }),
  };

  // Load settings data function
  const loadSettingsData = async () => {
    try {
      const response = await getSetting("razorpay");
      // Extract the first vertex from the result array
      const vertex = response.result?.[0];

      if (vertex?.P) {
        replaceVertexProperties(0, formDataId, graph, setGraph, vertex.P);
      }
    } catch (err) {
      showErrorToast((err as Error).message);
    }
  };

  // Load settings data when component mounts
  onMount(() => {
    loadSettingsData();
  });

  return (
    <SchemaRenderer
      form={{ attributes: [form], key: "RazorpaySettings" }}
      formDataId={formDataId}
    />
  );
}
