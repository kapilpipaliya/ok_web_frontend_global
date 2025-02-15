import { v7 as uuidv7 } from "uuid";

import { PROPERTIES } from "~/components/styled/constants/constant";
import { useToast } from "~/components/styled/Toast";
import { API } from "~/lib/api/endpoints";
import { getAPI } from "~/lib/api/getApi";
import { postAPI } from "~/lib/api/postApi";
import { useGraph } from "~/lib/graph/graph";
import { setSelectionValue } from "~/lib/graph/mutate/setSelectionValue";
import { addNewVertex, replaceVertexProperties } from "~/lib/graph/mutate/vertex";

import { SchemaRenderer } from "../SchemaRenderer";
import { CompanyLogoSettings } from "./CompanyLogoSettings";

export function GeneralSettings() {
  const GRID_ITEM_CLASS = "grid grid-template-columns:200px|400px ai:center gap:8";
  const LABEL_CLASS = "color:dimgrey font-weight:500 font:15";
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
            class: LABEL_CLASS,
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
        class: GRID_ITEM_CLASS,
        componentName: "Box",
      },
      {
        as: "div",
        attributes: [
          {
            class: LABEL_CLASS,
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
        class: GRID_ITEM_CLASS,
        componentName: "Box",
      },
      {
        as: "div",
        attributes: [
          {
            as: "button",
            class: "bg:primary fg:base-5 p:8|16 r:4 cursor:pointer border:none mr:8",
            componentName: "Box",
            props: () => ({
              onClick: async () => {
                const settings = graph.vertexes[formDataId];
                const response = await postAPI(API.updateGeneralSettingsUrl, settings.P);
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
    class: "p:10 grid gap:10",
    componentName: "Box",
  };

  // Add loadSettingsData function
  const loadSettingsData = async () => {
    try {
      const data = await getAPI(API.getGeneralSettingsUrl);
      if (data.settings?.P) {
        replaceVertexProperties(0, formDataId, graph, setGraph, data.settings.P);
      }

      // Create company logo vertex and edge if exists
      if (data.companyLogo) {
        if (!graph.vertexes[data.companyLogo.id]) {
          addNewVertex(
            0,
            data.companyLogo,
            graph,
            setGraph,
          );
        }
        setSelectionValue(
          0,
          graph.vertexes[formDataId],
          graph,
          setGraph,
          { id: "", IN: {}, L: [], OUT: {}, P: { type: "CompanyLogo" } },
          data.companyLogo.id
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
      <SchemaRenderer form={{ attributes: [form], key: "GeneralSettings" }} formDataId={formDataId} />
      <hr class="my-8 border-t border-gray-200" />
      <CompanyLogoSettings />
    </div>
  );
} 