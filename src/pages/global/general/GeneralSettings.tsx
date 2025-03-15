import { onMount } from "solid-js";
import { createStore } from "solid-js/store";
import { v7 as uuidv7 } from "uuid";

import type { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";

import { useToast } from "~/components/styled/Toast";
import { API } from "~/lib/api/endpoints";
import { getAPI } from "~/lib/api/general/getApi";
import { postAPI } from "~/lib/api/general/postApi";
import { useGraph } from "~/lib/graph/graph";
import {
  addNewVertex,
  replaceVertexProperties,
} from "~/lib/graph/mutate/core/vertex";
import { PROPERTIES, SETTINGS_CONSTANTS } from "~/pages/settings/constants";

import { SchemaRenderer } from "../../SchemaRenderer";
import { CompanyLogoSettings } from "./CompanyLogoSettings";

export function GeneralSettings() {
  const [graph, setGraph] = useGraph();
  const { showErrorToast, showSuccessToast } = useToast();

  // because we are loading custom settings, we need to create a new vertex
  const formDataId = uuidv7();
  addNewVertex(
    0,
    {
      id: formDataId,
      IN: {},
      L: ["GlobalSetting"],
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
            class: SETTINGS_CONSTANTS.LABEL_CLASS,
            as: "span", componentName: "Html",
            text: "Application Name",
          },
          {
            class: PROPERTIES.Css.TextField,
            componentName: "TextInput",
            key: "appName",
            placeholder: "Enter application name",
          },
        ],
        class: SETTINGS_CONSTANTS.GRID_ITEM_CLASS,
        componentName: "Html",
      },
      {
        as: "div",
        attributes: [
          {
            class: SETTINGS_CONSTANTS.LABEL_CLASS,
            as: "span", componentName: "Html",
            text: "Default Language",
          },
          {
            class: "",
            componentName: "Select",
            key: "defaultLanguage",
            options: [
              { id: "en", label: "English" },
              { id: "es", label: "Spanish" },
              { id: "fr", label: "French" },
            ],
            placeholder: "Select Default Language",
          },
        ],
        class: SETTINGS_CONSTANTS.GRID_ITEM_CLASS,
        componentName: "Html",
      },
      {
        as: "div",
        attributes: [
          {
            attributes: [
              {
                as: "button",
                class: SETTINGS_CONSTANTS.SAVE_BUTTON_CLASS,
                componentName: "Html",
                props: (options: FunctionArgumentType) => ({
                  disabled: options.dataContext.saveState[0]?.isLoading,
                  onClick: async () => {
                    try {
                      options.dataContext.saveState[1]("isLoading", true);
                      const settings = graph.vertexes[formDataId];
                      const response = await postAPI(
                        API.settings.general.updateUrl,
                        settings.P,
                      );
                      if (response.error) {
                        showErrorToast(response.error);
                      } else {
                        showSuccessToast("Settings updated successfully");
                      }
                    } catch (error) {
                      showErrorToast((error as Error).message);
                    } finally {
                      options.dataContext.saveState[1]("isLoading", false);
                    }
                  },
                  text: options.dataContext.saveState[0]?.isLoading
                    ? "Saving..."
                    : "Save Changes",
                }),
              },
            ],
            componentName: "Data",
            name: "saveState",
            
            props: () => ({
              data: createStore({
                isLoading: false,
              }),
            }),
          },
        ],
        class: "mt:24",
        componentName: "Html",
      },
    ],
    class: SETTINGS_CONSTANTS.FORM_CLASS,
    componentName: "Html",
    props: () => ({
      // TODO: if not saved, revert to previous state
      // onUnmount: () => {
      //   options.revertTransactionUpToIndex(options.txnId, -1);
      // }
    }),
  };

  // Add loadSettingsData function
  const loadSettingsData = async () => {
    try {
      const data = await getAPI(API.settings.general.getUrl);
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

  // Load settings data when component mounts
  onMount(() => {
    loadSettingsData();
  });

  return (
    <div>
      <SchemaRenderer
        form={{ attributes: [form], key: "GeneralSettings" }}
        formDataId={formDataId}
      />
      <hr class={SETTINGS_CONSTANTS.SECTION_DIVIDER_CLASS} />
      <CompanyLogoSettings />
    </div>
  );
}
