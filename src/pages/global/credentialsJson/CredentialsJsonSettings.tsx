import { onMount } from "solid-js";
import { createStore } from "solid-js/store";
import { v7 as uuidv7 } from "uuid";

import type { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";

import { useToast } from "~/components/styled/modal/Toast";
import { API } from "~/lib/api/endpoints";
import { getAPI } from "~/lib/api/general/getApi";
import { postAPI } from "~/lib/api/general/postApi";
import { PROPERTIES, SETTINGS_CONSTANTS } from "~/pages/settings/constants";

import { SchemaRenderer } from "../../SchemaRenderer";
import { addNewVertex } from "~/lib/graph/mutate/core/vertex/addNewVertex";
import { replaceVertexProperties } from "~/lib/graph/mutate/core/vertex/replaceVertexProperties";
import { useGraph } from "~/lib/graph/context/UseGraph";

type SaveStateStore = ReturnType<
  typeof createStore<{
    isLoading: boolean;
  }>
>;

interface CredentialsJsonSettingsFunctionArgumentType
  extends FunctionArgumentType {
  contextData: {
    saveState: SaveStateStore;
  };
}

export function CredentialsJsonSettings() {
  const [graph, setGraph] = useGraph();
  const { showErrorToast, showSuccessToast } = useToast();

  const formDataId = uuidv7();
  addNewVertex(
    0,
    {
      id: formDataId,
      IN: {},
      L: ["CredentialsJson"],
      OUT: {},
      P: {},
    },
    graph,
    setGraph,
  );

  const form = {
    as: "div",
    attributes: [
      {
        as: "div",
        attributes: [
          {
            as: "span",
            css: SETTINGS_CONSTANTS.LABEL_CSS,
            componentName: "Html",
            text: "Credentials JSON",
          },
          {
            css: PROPERTIES.Css.TextFieldCss,
            componentName: "SystemTextInput",
            key: "credentialsJson",
            placeholder:
              '{"shopifyAPIKey": "...", "shopifyAPISecret": "...", "shopifyAppUrl": "https://...", "shopifyScopes": "read_products,write_products"}',
            rows: 16,
            type: "textarea",
          },
        ],
        css: SETTINGS_CONSTANTS.GRID_ITEM_CSS,
        componentName: "Html",
      },
      {
        as: "div",
        attributes: [
          {
            attributes: [
              {
                as: "button",
                css: SETTINGS_CONSTANTS.SAVE_BUTTON_CSS,
                componentName: "Html",
                props: (
                  options: CredentialsJsonSettingsFunctionArgumentType,
                ) => ({
                  disabled: options.contextData.saveState[0]?.isLoading,
                  onClick: async () => {
                    try {
                      options.contextData.saveState[1]("isLoading", true);
                      const settings = graph.vertexes[formDataId];
                      const response = await postAPI(
                        API.settings.credentialsJson.updateUrl,
                        {
                          credentialsJson: settings.P?.credentialsJson ?? "",
                        },
                      );
                      if (response.error) {
                        showErrorToast(String(response.error));
                      } else {
                        showSuccessToast("Credentials JSON saved successfully");
                      }
                    } catch (error) {
                      showErrorToast((error as Error).message);
                    } finally {
                      options.contextData.saveState[1]("isLoading", false);
                    }
                  },
                  text: options.contextData.saveState[0]?.isLoading
                    ? "Saving..."
                    : "Save",
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
    props: (options: FunctionArgumentType) => ({
      onCleanup: () => {
        options.revertTransactionUpToIndex(options.txnId, -1);
      },
    }),
  };

  const loadSettingsData = async () => {
    try {
      const data = await getAPI(API.settings.credentialsJson.getUrl);
      if (data.settings?.P) {
        replaceVertexProperties(
          0,
          formDataId,
          graph,
          setGraph,
          data.settings.P,
        );
      }
    } catch (err) {
      showErrorToast((err as Error).message);
    }
  };

  onMount(() => {
    loadSettingsData();
  });

  return (
    <div>
      <SchemaRenderer
        form={{ attributes: [form], key: "CredentialsJsonSettings" }}
        formDataId={formDataId}
      />
    </div>
  );
}
