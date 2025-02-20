import { v7 as uuidv7 } from "uuid";

import { PROPERTIES } from "~/components/styled/constants/constant";
import { useToast } from "~/components/styled/Toast";
import { API } from "~/lib/api/endpoints";
import { getAPI } from "~/lib/api/getApi";
import { postAPI } from "~/lib/api/postApi";
import { useGraph } from "~/lib/graph/graph";
import { setSelectionValue } from "~/lib/graph/mutate/setSelectionValue";
import {
  addNewVertex,
  replaceVertexProperties,
} from "~/lib/graph/mutate/vertex";
import { SETTINGS_CONSTANTS } from "~/pages/settings/constants";

import { SchemaRenderer } from "../../SchemaRenderer";
import { CompanyLogoSettings } from "./CompanyLogoSettings";

export function GeneralSettings() {
  const [graph, setGraph] = useGraph();
  const { showErrorToast, showSuccessToast } = useToast();

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
            componentName: "Text",
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
        componentName: "Box",
      },
      {
        as: "div",
        attributes: [
          {
            class: SETTINGS_CONSTANTS.LABEL_CLASS,
            componentName: "Text",
            text: "Default Language",
          },
          {
            class: "border:1px|solid|#ccc p:5|10 r:4",
            componentName: "Select",
            key: "defaultLanguage",
            options: [
              { text: "English", value: "en" },
              { text: "Spanish", value: "es" },
              { text: "French", value: "fr" },
            ],
          },
        ],
        class: SETTINGS_CONSTANTS.GRID_ITEM_CLASS,
        componentName: "Box",
      },
      {
        as: "div",
        attributes: [
          {
            as: "button",
            class: SETTINGS_CONSTANTS.SAVE_BUTTON_CLASS,
            componentName: "Box",
            props: () => ({
              onClick: async () => {
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
              },
            }),
            text: "Save Changes",
          },
        ],
        class: "mt:24",
        componentName: "Box",
      },
    ],
    class: SETTINGS_CONSTANTS.FORM_CLASS,
    componentName: "Box",
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

      // Create company logo vertex and edge if exists
      if (data.companyLogo) {
        if (!graph.vertexes[data.companyLogo.id]) {
          addNewVertex(0, data.companyLogo, graph, setGraph);
        }
        setSelectionValue(
          0,
          graph.vertexes[formDataId],
          graph,
          setGraph,
          { id: "", IN: {}, L: [], OUT: {}, P: { type: "CompanyLogo" } },
          data.companyLogo.id,
        );
      }
    } catch (err) {
      showErrorToast((err as Error).message);
    }
  };

  // Load settings data when component mounts
  loadSettingsData();

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
