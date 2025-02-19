import { type Component, createSignal } from "solid-js";
import { createStore } from "solid-js/store";
import { v7 as uuidv7 } from "uuid";

import type { FieldAttribute } from "~/lib/meta/FormMetadataType";

import { FunctionArgumentType } from "~/components/form/FieldSchemaType";
import { PROPERTIES } from "~/components/styled/constants/constant";
import { useToast } from "~/components/styled/Toast";
import { API } from "~/lib/api/endpoints";
import { postAPI } from "~/lib/api/postApi";
import { useGraph } from "~/lib/graph/graph";
import { addNewVertex } from "~/lib/graph/mutate/vertex";

import { SchemaRenderer } from "../SchemaRenderer";

const GRID_ITEM_CLASS =
  "grid grid-template-columns:150px|400px ai:center gap:8";
const LABEL_CLASS = "fg:base-50 font-weight:500 font:15";

interface Props {
  onSuccess: () => void;
}

export const AddSubDomainForm: Component<Props> = (props) => {
  const [graph, setGraph] = useGraph();
  const { showErrorToast, showSuccessToast } = useToast();
  const formDataId = uuidv7();

  // Initialize form data vertex
  addNewVertex(
    0,
    {
      id: formDataId,
      IN: {},
      L: ["SubDomain"],
      OUT: {},
      P: {},
    },
    graph,
    setGraph,
  );

  const handleSave = async (options: FunctionArgumentType) => {
    const formData = graph.vertexes[formDataId];
    if (!formData.P.key?.trim()) {
      showErrorToast("Please enter subdomain name");
      return;
    }
    if (!formData.P.domain?.trim()) {
      showErrorToast("Please enter domain");
      return;
    }

    try {
      options.dataContext.modalState[1]("isLoading", true);
      const response = await postAPI(API.subdomain.createUrl, {
        domain: formData.P.domain,
        key: formData.P.key,
      });

      if (response.error) {
        showErrorToast(response.error);
      } else {
        showSuccessToast("Subdomain created successfully");
        props.onSuccess();
      }
    } catch (error) {
      showErrorToast((error as Error).message);
    } finally {
      options.dataContext.modalState[1]("isLoading", false);
    }
  };

  const formSchema = {
    as: "div",
    attributes: [
      {
        as: "div",
        attributes: [
          {
            as: "div",
            attributes: [
              {
                class: LABEL_CLASS,
                componentName: "Text",
                text: "Name",
                validation: { required: true },
              },
              {
                class: PROPERTIES.Css.TextField,
                componentName: "TextInput",
                key: "key",
                placeholder: "Enter subdomain name",
                validation: { required: true },
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
                text: "Domain",
                validation: { required: true },
              },
              {
                class: PROPERTIES.Css.TextField,
                componentName: "TextInput",
                key: "domain",
                placeholder: "Enter domain (Optional) eg: example.com",
              },
            ],
            class: GRID_ITEM_CLASS,
            componentName: "Box",
          },
        ],
        class: "p:16 grid gap:10",
        componentName: "Box",
      },
    ],
    componentName: "Box",
  };

  const modalHeaderSchema = {
    as: "div",
    attributes: [
      {
        class: "font-size:18 font-weight:500",
        componentName: "Text",
        text: "Add New SubDomain",
      }
    ],
    class: "p:16 border-bottom:1px|solid|base-20",
    componentName: "Box"
  };

  const modalFooterSchema = {
    as: "div",
    attributes: [
      {
        class: "bg:base-10 fg:base-80 p:8|16 r:4 cursor:pointer border:1px|solid|base-20",
        componentName: "Button",
        props: (options: FunctionArgumentType) => ({
          onClick: () => {
            options.dataContext.modalState[1]("showModal", false);
          },
          text: "Cancel",
        }),
      },
      {
        class: "bg:primary fg:base-5 p:8|16 r:4 cursor:pointer border:none",
        componentName: "Button",
        props: (options: FunctionArgumentType) => ({
          disabled: options.dataContext.modalState[0]?.["isLoading"],
          onClick: handleSave,
          text: options.dataContext.modalState[0]?.["isLoading"] ? "Saving..." : "Save",
        }),
      },
    ],
    class: "display:flex jc:flex-end p:16 gap:6 border-top:1px|solid|base-20 bg:base-5",
    componentName: "Box",
  };
  const schema: FieldAttribute = {
    attributes: [
      {
        as: "div",
        attributes: [
          {
            class: "bg:primary fg:base-5 p:8|16 r:4 cursor:pointer border:none",
            componentName: "Button",
            props: (options: FunctionArgumentType) => ({
              onClick: () => {
                options.dataContext.modalState[1]("showModal", true);
              },
              text: "Add New SubDomain",
            }),
          },
          {
            as: "dialog",
            attributes: [
              modalHeaderSchema,
              formSchema,
              modalFooterSchema,
            ],
            class: "border:1px|solid|base-20 r:4 p:0 w:600px position:fixed top:50% left:50% transform:translate(-50%,-50%) bg:base-5 z:1",
            componentName: "Html",
            open: true,
            props: (options: FunctionArgumentType) => ({
              hidden: !options.dataContext.modalState[0]?.["showModal"],
            }),
          },
        ],
        componentName: "Box",
      }
    ],
    componentName: "Data",
    name: "modalState",
    noRepeat: true,
    props: () => {
      return {
        data: createStore({
          isLoading: false,
          showModal: false,
        }),
      }
    },
  };

  return (
    <SchemaRenderer
      form={{ attributes: [schema], key: "SubDomain" }}
      formDataId={formDataId}
    />
  );
};
