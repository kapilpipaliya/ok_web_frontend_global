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

export function CompanySettings() {
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
      L: ["CompanySettings"],
      OUT: {},
      P: {},
    },
    graph,
    setGraph,
  );

  const loadSettingsData = async () => {
    try {
      const data = await getAPI(API.getCompanySettingsUrl);
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
            text: "Company Name",
          },
          {
            class: PROPERTIES.Css.TextField,
            componentName: "TextInput",
            key: "companyName",
            placeholder: "Enter company name",
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
            text: "Address",
          },
          {
            class: PROPERTIES.Css.TextField,
            componentName: "TextArea",
            key: "address",
            placeholder: "Enter company address",
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
            text: "Contact Email",
          },
          {
            class: PROPERTIES.Css.TextField,
            componentName: "TextInput",
            key: "contactEmail",
            placeholder: "Enter contact email",
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
            text: "Phone",
          },
          {
            class: PROPERTIES.Css.TextField,
            componentName: "TextInput",
            key: "phone",
            placeholder: "Enter phone number",
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
                try {
                  const settings = graph.vertexes[formDataId];
                  const response = await postAPI(
                    API.updateCompanySettingsUrl,
                    settings.P,
                  );
                  if (response.error) {
                    showErrorToast(response.error);
                  } else {
                    showSuccessToast("Company details updated successfully");
                  }
                } catch (error) {
                  showErrorToast((error as Error).message);
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

  return (
    <SchemaRenderer
      form={{ attributes: [form], key: "CompanySettings" }}
      formDataId={formDataId}
    />
  );
}
