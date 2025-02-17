import { v7 as uuidv7 } from "uuid";

import { PROPERTIES } from "~/components/styled/constants/constant";
import { useToast } from "~/components/styled/Toast";
import { API } from "~/lib/api/endpoints";
import { getAPI } from "~/lib/api/getApi";
import { postAPI } from "~/lib/api/postApi";
import { useGraph } from "~/lib/graph/graph";
import {
  addNewVertex,
  replaceVertexProperties,
} from "~/lib/graph/mutate/vertex";

import { SchemaRenderer } from "../SchemaRenderer";

export function EmailSettings() {
  const GRID_ITEM_CLASS =
    "grid grid-template-columns:200px|400px ai:center gap:8";
  const LABEL_CLASS = "color:dimgrey font-weight:500 font:15";
  const [graph, setGraph] = useGraph();
  const { showErrorToast, showSuccessToast } = useToast();

  const formDataId = uuidv7();
  addNewVertex(
    0,
    {
      id: formDataId,
      IN: {},
      L: ["EmailSettings"],
      OUT: {},
      P: {},
    },
    graph,
    setGraph,
  );

  const loadSettingsData = async () => {
    try {
      const data = await getAPI(API.getEmailSettingsUrl);
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

  loadSettingsData();

  const form = {
    as: "div",
    attributes: [
      {
        as: "div",
        attributes: [
          {
            class: LABEL_CLASS,
            componentName: "Text",
            text: "SMTP Host",
          },
          {
            class: PROPERTIES.Css.TextField,
            componentName: "TextInput",
            key: "smtpHost",
            placeholder: "Enter SMTP host",
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
            text: "SMTP Port",
          },
          {
            class: PROPERTIES.Css.TextField,
            componentName: "TextInput",
            key: "smtpPort",
            placeholder: "Enter SMTP port",
            type: "number",
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
            text: "SMTP Username",
          },
          {
            class: PROPERTIES.Css.TextField,
            componentName: "TextInput",
            key: "smtpUsername",
            placeholder: "Enter SMTP username",
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
            text: "SMTP Password",
          },
          {
            class: PROPERTIES.Css.TextField,
            componentName: "TextInput",
            key: "smtpPassword",
            placeholder: "Enter SMTP password",
            type: "password",
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
            text: "From Email",
          },
          {
            class: PROPERTIES.Css.TextField,
            componentName: "TextInput",
            key: "fromEmail",
            placeholder: "Enter from email address",
            type: "email",
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
            text: "Use Secure Connection",
          },
          {
            componentName: "Checkbox",
            key: "secure",
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
            class:
              "bg:primary fg:base-5 p:8|16 r:4 cursor:pointer border:none mr:8",
            componentName: "Box",
            props: () => ({
              onClick: async () => {
                const settings = graph.vertexes[formDataId];
                const response = await postAPI(
                  API.updateEmailSettingsUrl,
                  settings.P,
                );
                if (response.error) {
                  showErrorToast(response.error);
                } else {
                  showSuccessToast("Email settings updated successfully");
                }
              },
            }),
            text: "Save Changes",
          },
          {
            as: "button",
            class:
              "bg:secondary fg:base-5 p:8|16 r:4 cursor:pointer border:none",
            componentName: "Box",
            props: () => ({
              onClick: async () => {
                const settings = graph.vertexes[formDataId];
                const response = await postAPI(
                  API.testEmailSettingsUrl,
                  settings.P,
                );
                if (response.error) {
                  showErrorToast(response.error);
                } else {
                  showSuccessToast("Test email sent successfully");
                }
              },
            }),
            text: "Test Connection",
          },
        ],
        class: "mt:24",
        componentName: "Box",
      },
    ],
    class: "p:10 grid gap:10",
    componentName: "Box",
  };

  return (
    <SchemaRenderer
      form={{ attributes: [form], key: "EmailSettings" }}
      formDataId={formDataId}
    />
  );
}
