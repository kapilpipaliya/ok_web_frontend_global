import { onMount } from "solid-js";
import { createStore } from "solid-js/store";
import { v7 as uuidv7 } from "uuid";

import type { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";

import { useToast } from "~/components/styled/modal/Toast";
import { getErrorSchema } from "~/lib/schema/getErrorSchema";
import {
  DEFAULT_MEDIA_SETTING_PROPS,
  validateMediaSettingProps,
} from "~/lib/files/mediaOptimizationConfig";
import { DEFAULT_IMAGE_SETTING_PROPS } from "~/lib/files/imageOptimizationConfig";
import { DEFAULT_VIDEO_SETTING_PROPS } from "~/lib/files/videoOptimizationConfig";

import { SchemaRenderer } from "../../SchemaRenderer";
import { PROPERTIES, SETTINGS_CONSTANTS } from "../../settings/constants";
import { getSetting, saveSetting } from "~/lib/api/client/settingsClient";
import { addNewVertex } from "~/lib/graph/mutate/core/vertex/addNewVertex";
import { replaceVertexProperties } from "~/lib/graph/mutate/core/vertex/replaceVertexProperties";
import { useGraph } from "~/lib/graph/context/UseGraph";

type SaveStateStore = ReturnType<
  typeof createStore<{
    isLoading: boolean;
    isBackfilling: boolean;
  }>
>;

interface ImageSettingsData {
  imageOptimizationEnabled?: boolean;
  keepOriginal?: boolean;
  formats?: string;
  quality?: number | string;
  effort?: number | string;
  minWidthToVariant?: number | string;
  autoRotate?: boolean;
  stripMetadata?: boolean;
  variantsJson?: string;
  videoOptimizationEnabled?: boolean;
  videoKeepOriginal?: boolean;
  videoPoster?: boolean;
  videoPosterSeekSeconds?: number | string;
  videoOutputsJson?: string;
  [key: string]: unknown;
}

interface ImageSettingsFunctionArgumentType extends FunctionArgumentType {
  contextData: {
    saveState: SaveStateStore;
    [key: string]: unknown;
  };
}

export function ImageSettings() {
  const [graph, setGraph] = useGraph();
  const { showErrorToast, showSuccessToast } = useToast();

  const formDataId = uuidv7();
  addNewVertex(
    0,
    {
      id: formDataId,
      IN: {},
      L: ["MediaSettings"],
      OUT: {},
      P: { ...DEFAULT_MEDIA_SETTING_PROPS },
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
  color: \${t.var.color.text};
  margin-bottom: 0.5rem;
}\`;`,
            componentName: "Html",
            text: "Media Optimization",
          },
          {
            as: "p",
            css: `return \`._id {
  font-size: 0.875rem;
  color: \${t.var.color.text_dark_300};
  margin-bottom: 1.5rem;
}\`;`,
            componentName: "Html",
            text: "Configure upload-time image (Sharp) and video (FFmpeg) optimization. Variants are generated asynchronously after each upload.",
          },
          {
            as: "h4",
            css: `return \`._id {
  font-size: 1rem;
  font-weight: 600;
  color: \${t.var.color.text};
  margin: 1.25rem 0 0.75rem;
}\`;`,
            componentName: "Html",
            text: "Images",
          },
          {
            as: "div",
            attributes: [
              {
                as: "span",
                css: SETTINGS_CONSTANTS.LABEL_CSS,
                componentName: "Html",
                text: "Enable image optimization",
              },
              {
                componentName: "SystemTextInput",
                css: [PROPERTIES.Css.CheckBoxCss],
                key: "imageOptimizationEnabled",
                type: "checkbox",
              },
            ],
            css: SETTINGS_CONSTANTS.GRID_ITEM_CSS,
            componentName: "Html",
          },
          {
            as: "div",
            attributes: [
              {
                as: "span",
                css: SETTINGS_CONSTANTS.LABEL_CSS,
                componentName: "Html",
                text: "Keep original file",
              },
              {
                componentName: "SystemTextInput",
                css: [PROPERTIES.Css.CheckBoxCss],
                key: "keepOriginal",
                type: "checkbox",
              },
            ],
            css: SETTINGS_CONSTANTS.GRID_ITEM_CSS,
            componentName: "Html",
            props: (options: ImageSettingsFunctionArgumentType) => ({
              hide: () => !options.data?.P.imageOptimizationEnabled,
            }),
          },
          {
            as: "div",
            attributes: [
              {
                as: "span",
                css: SETTINGS_CONSTANTS.LABEL_CSS,
                componentName: "Html",
                text: "Auto-rotate (EXIF)",
              },
              {
                componentName: "SystemTextInput",
                css: [PROPERTIES.Css.CheckBoxCss],
                key: "autoRotate",
                type: "checkbox",
              },
            ],
            css: SETTINGS_CONSTANTS.GRID_ITEM_CSS,
            componentName: "Html",
            props: (options: ImageSettingsFunctionArgumentType) => ({
              hide: () => !options.data?.P.imageOptimizationEnabled,
            }),
          },
          {
            as: "div",
            attributes: [
              {
                as: "span",
                css: SETTINGS_CONSTANTS.LABEL_CSS,
                componentName: "Html",
                text: "Strip metadata (GPS, camera, etc.)",
              },
              {
                componentName: "SystemTextInput",
                css: [PROPERTIES.Css.CheckBoxCss],
                key: "stripMetadata",
                type: "checkbox",
              },
            ],
            css: SETTINGS_CONSTANTS.GRID_ITEM_CSS,
            componentName: "Html",
            props: (options: ImageSettingsFunctionArgumentType) => ({
              hide: () => !options.data?.P.imageOptimizationEnabled,
            }),
          },
          {
            as: "div",
            attributes: [
              {
                as: "span",
                css: SETTINGS_CONSTANTS.LABEL_CSS,
                componentName: "Html",
                text: "Formats (comma-separated)",
              },
              {
                css: PROPERTIES.Css.TextFieldCss,
                componentName: "SystemTextInput",
                key: "formats",
                placeholder: "webp",
              },
            ],
            css: SETTINGS_CONSTANTS.GRID_ITEM_CSS,
            componentName: "Html",
            props: (options: ImageSettingsFunctionArgumentType) => ({
              hide: () => !options.data?.P.imageOptimizationEnabled,
            }),
          },
          {
            as: "div",
            attributes: [
              {
                as: "span",
                css: SETTINGS_CONSTANTS.LABEL_CSS,
                componentName: "Html",
                text: "WebP quality (1–100)",
              },
              {
                css: PROPERTIES.Css.TextFieldCss,
                componentName: "SystemTextInput",
                key: "quality",
                type: "number",
                placeholder: "80",
              },
            ],
            css: SETTINGS_CONSTANTS.GRID_ITEM_CSS,
            componentName: "Html",
            props: (options: ImageSettingsFunctionArgumentType) => ({
              hide: () => !options.data?.P.imageOptimizationEnabled,
            }),
          },
          getErrorSchema(
            "quality",
            "return `._id {color: ${t.var.color.error}; margin-top: -20px;};`",
          ),
          {
            as: "div",
            attributes: [
              {
                as: "span",
                css: SETTINGS_CONSTANTS.LABEL_CSS,
                componentName: "Html",
                text: "WebP effort (0–6)",
              },
              {
                css: PROPERTIES.Css.TextFieldCss,
                componentName: "SystemTextInput",
                key: "effort",
                type: "number",
                placeholder: "4",
              },
            ],
            css: SETTINGS_CONSTANTS.GRID_ITEM_CSS,
            componentName: "Html",
            props: (options: ImageSettingsFunctionArgumentType) => ({
              hide: () => !options.data?.P.imageOptimizationEnabled,
            }),
          },
          getErrorSchema(
            "effort",
            "return `._id {color: ${t.var.color.error}; margin-top: -20px;};`",
          ),
          {
            as: "div",
            attributes: [
              {
                as: "span",
                css: SETTINGS_CONSTANTS.LABEL_CSS,
                componentName: "Html",
                text: "Min width for multi-size variants",
              },
              {
                css: PROPERTIES.Css.TextFieldCss,
                componentName: "SystemTextInput",
                key: "minWidthToVariant",
                type: "number",
                placeholder: "300",
              },
            ],
            css: SETTINGS_CONSTANTS.GRID_ITEM_CSS,
            componentName: "Html",
            props: (options: ImageSettingsFunctionArgumentType) => ({
              hide: () => !options.data?.P.imageOptimizationEnabled,
            }),
          },
          getErrorSchema(
            "minWidthToVariant",
            "return `._id {color: ${t.var.color.error}; margin-top: -20px;};`",
          ),
          {
            as: "div",
            attributes: [
              {
                as: "span",
                css: SETTINGS_CONSTANTS.LABEL_CSS,
                componentName: "Html",
                text: "Variants JSON",
              },
              {
                css: PROPERTIES.Css.TextFieldCss,
                componentName: "SystemTextInput",
                key: "variantsJson",
                type: "textarea",
                placeholder:
                  '[{"name":"thumb","width":200},{"name":"small","width":500}]',
              },
            ],
            css: SETTINGS_CONSTANTS.GRID_ITEM_CSS,
            componentName: "Html",
            props: (options: ImageSettingsFunctionArgumentType) => ({
              hide: () => !options.data?.P.imageOptimizationEnabled,
            }),
          },
          getErrorSchema(
            "variantsJson",
            "return `._id {color: ${t.var.color.error}; margin-top: -20px;};`",
          ),
          {
            as: "h4",
            css: `return \`._id {
  font-size: 1rem;
  font-weight: 600;
  color: \${t.var.color.text};
  margin: 1.75rem 0 0.75rem;
}\`;`,
            componentName: "Html",
            text: "Videos",
          },
          {
            as: "div",
            attributes: [
              {
                as: "span",
                css: SETTINGS_CONSTANTS.LABEL_CSS,
                componentName: "Html",
                text: "Enable video optimization",
              },
              {
                componentName: "SystemTextInput",
                css: [PROPERTIES.Css.CheckBoxCss],
                key: "videoOptimizationEnabled",
                type: "checkbox",
              },
            ],
            css: SETTINGS_CONSTANTS.GRID_ITEM_CSS,
            componentName: "Html",
          },
          {
            as: "div",
            attributes: [
              {
                as: "span",
                css: SETTINGS_CONSTANTS.LABEL_CSS,
                componentName: "Html",
                text: "Keep original video",
              },
              {
                componentName: "SystemTextInput",
                css: [PROPERTIES.Css.CheckBoxCss],
                key: "videoKeepOriginal",
                type: "checkbox",
              },
            ],
            css: SETTINGS_CONSTANTS.GRID_ITEM_CSS,
            componentName: "Html",
            props: (options: ImageSettingsFunctionArgumentType) => ({
              hide: () => !options.data?.P.videoOptimizationEnabled,
            }),
          },
          {
            as: "div",
            attributes: [
              {
                as: "span",
                css: SETTINGS_CONSTANTS.LABEL_CSS,
                componentName: "Html",
                text: "Generate poster.webp",
              },
              {
                componentName: "SystemTextInput",
                css: [PROPERTIES.Css.CheckBoxCss],
                key: "videoPoster",
                type: "checkbox",
              },
            ],
            css: SETTINGS_CONSTANTS.GRID_ITEM_CSS,
            componentName: "Html",
            props: (options: ImageSettingsFunctionArgumentType) => ({
              hide: () => !options.data?.P.videoOptimizationEnabled,
            }),
          },
          {
            as: "div",
            attributes: [
              {
                as: "span",
                css: SETTINGS_CONSTANTS.LABEL_CSS,
                componentName: "Html",
                text: "Poster seek (seconds)",
              },
              {
                css: PROPERTIES.Css.TextFieldCss,
                componentName: "SystemTextInput",
                key: "videoPosterSeekSeconds",
                type: "number",
                placeholder: "2",
              },
            ],
            css: SETTINGS_CONSTANTS.GRID_ITEM_CSS,
            componentName: "Html",
            props: (options: ImageSettingsFunctionArgumentType) => ({
              hide: () =>
                !options.data?.P.videoOptimizationEnabled ||
                !options.data?.P.videoPoster,
            }),
          },
          getErrorSchema(
            "videoPosterSeekSeconds",
            "return `._id {color: ${t.var.color.error}; margin-top: -20px;};`",
          ),
          {
            as: "div",
            attributes: [
              {
                as: "span",
                css: SETTINGS_CONSTANTS.LABEL_CSS,
                componentName: "Html",
                text: "Video outputs JSON",
              },
              {
                css: PROPERTIES.Css.TextFieldCss,
                componentName: "SystemTextInput",
                key: "videoOutputsJson",
                type: "textarea",
                placeholder:
                  '[{"name":"360","width":640,"bitrate":"800k"},{"name":"720","width":1280,"bitrate":"2500k"}]',
              },
            ],
            css: SETTINGS_CONSTANTS.GRID_ITEM_CSS,
            componentName: "Html",
            props: (options: ImageSettingsFunctionArgumentType) => ({
              hide: () => !options.data?.P.videoOptimizationEnabled,
            }),
          },
          getErrorSchema(
            "videoOutputsJson",
            "return `._id {color: ${t.var.color.error}; margin-top: -20px;};`",
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
                    props: (options: ImageSettingsFunctionArgumentType) => ({
                      disabled: options.contextData.saveState[0]?.isLoading,
                      onClick: async () => {
                        try {
                          options.contextData.saveState[1]("isLoading", true);
                          const settings = graph.vertexes[formDataId];
                          const errors = validateMediaSettingProps(
                            settings.P as ImageSettingsData,
                          );
                          if (errors) {
                            for (const fieldKey in errors) {
                              options.setError(errors[fieldKey], fieldKey);
                            }
                            showErrorToast("Please fix the validation errors");
                            return;
                          }
                          options.clearAllErrors();
                          const response = await saveSetting(
                            "media",
                            settings.P as ImageSettingsData,
                          );
                          if (response.error) {
                            showErrorToast(
                              response.error ||
                                "Failed to save media settings",
                            );
                          } else {
                            showSuccessToast(
                              response.message ||
                                "Media settings saved successfully",
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
                  {
                    as: "button",
                    css: `return \`._id {
  margin-left: 0.75rem;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  border: 1px solid \${t.var.color.border};
  background: \${t.var.color.background_light_100};
  color: \${t.var.color.text};
  cursor: pointer;
  &:hover {
    background: \${t.var.color.background_light_200};
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}\`;`,
                    componentName: "Html",
                    props: (options: ImageSettingsFunctionArgumentType) => ({
                      disabled:
                        options.contextData.saveState[0]?.isBackfilling ||
                        options.contextData.saveState[0]?.isLoading,
                      onClick: async () => {
                        try {
                          options.contextData.saveState[1](
                            "isBackfilling",
                            true,
                          );
                          const response = await fetch(
                            "/api/file/optimize/backfill",
                            { method: "POST" },
                          );
                          const data = await response.json();
                          if (!response.ok || data.error) {
                            showErrorToast(
                              data.error || "Failed to queue media backfill",
                            );
                          } else {
                            showSuccessToast(
                              data.message ||
                                `Queued ${data.queued ?? 0} media file(s) for optimization`,
                            );
                          }
                        } catch (error) {
                          showErrorToast((error as Error).message);
                        } finally {
                          options.contextData.saveState[1](
                            "isBackfilling",
                            false,
                          );
                        }
                      },
                      text: options.contextData.saveState[0]?.isBackfilling
                        ? "Queueing..."
                        : "Backfill existing media",
                    }),
                  },
                ],
                componentName: "Html",
                contextName: "saveState",
                props: () => ({
                  data: createStore({
                    isLoading: false,
                    isBackfilling: false,
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

  const loadSettingsData = async () => {
    try {
      let response = await getSetting("media");
      let vertex = response.result?.[0];
      if (!vertex?.P) {
        response = await getSetting("image");
        vertex = response.result?.[0];
      }
      if (vertex?.P) {
        replaceVertexProperties(0, formDataId, graph, setGraph, {
          ...DEFAULT_IMAGE_SETTING_PROPS,
          ...DEFAULT_VIDEO_SETTING_PROPS,
          ...vertex.P,
        });
      }
    } catch (err) {
      showErrorToast((err as Error).message);
    }
  };

  onMount(() => {
    loadSettingsData();
  });

  return (
    <SchemaRenderer
      form={{ attributes: [form], key: "MediaSettings" }}
      formDataId={formDataId}
    />
  );
}
