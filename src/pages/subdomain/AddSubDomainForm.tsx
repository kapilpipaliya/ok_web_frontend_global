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
import { SETTINGS_CONSTANTS } from "../settings/constants";

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
                class: SETTINGS_CONSTANTS.LABEL_CLASS,
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
            class: SETTINGS_CONSTANTS.GRID_ITEM_CLASS,
            componentName: "Box",
          },
          {
            as: "div",
            attributes: [
              {
                class: SETTINGS_CONSTANTS.LABEL_CLASS,
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
            class: SETTINGS_CONSTANTS.GRID_ITEM_CLASS,
            componentName: "Box",
          },
        ],
        class: SETTINGS_CONSTANTS.FORM_CLASS,
        componentName: "Box",
      },
    ],
    componentName: "Box",
  };

  const modalHeaderSchema = {
    as: "div",
    attributes: [
      {
        class: SETTINGS_CONSTANTS.MODAL.HEADER.TEXT_CLASS,
        componentName: "Text",
        text: "Add New SubDomain",
      }
    ],
    class: SETTINGS_CONSTANTS.MODAL.HEADER.CLASS,
    componentName: "Box"
  };

  const modalFooterSchema = {
    as: "div",
    attributes: [
      {
        class: SETTINGS_CONSTANTS.MODAL.BUTTONS.CANCEL_CLASS,
        componentName: "Button",
        props: (options: FunctionArgumentType) => ({
          onClick: () => {
            options.dataContext.modalState[1]("showModal", false);
          },
          text: "Cancel",
        }),
      },
      {
        class: SETTINGS_CONSTANTS.MODAL.BUTTONS.SAVE_CLASS,
        componentName: "Button",
        props: (options: FunctionArgumentType) => ({
          disabled: options.dataContext.modalState[0]?.["isLoading"],
          onClick: handleSave,
          text: options.dataContext.modalState[0]?.["isLoading"] ? "Saving..." : "Save",
        }),
      },
    ],
    class: SETTINGS_CONSTANTS.MODAL.FOOTER.CLASS,
    componentName: "Box",
  };
  const schema: FieldAttribute = {
    attributes: [
      {
        as: "div",
        attributes: [
          {
            class: SETTINGS_CONSTANTS.MODAL.BUTTONS.SAVE_CLASS,
            componentName: "Button",
            props: (options: FunctionArgumentType) => ({
              onClick: () => {
                options.dataContext.modalState[1]("showModal", true);
              },
              text: "Add New SubDomain",
            }),
          },
          {
            as: "div",
            attributes: [],
            class: SETTINGS_CONSTANTS.MODAL.OVERLAY_CLASS,
            componentName: "Box",
            props: (options: FunctionArgumentType) => ({
              hidden: !options.dataContext.modalState[0]?.["showModal"],
            }),
          },
          {
            as: "dialog",
            attributes: [
              modalHeaderSchema,
              formSchema,
              modalFooterSchema,
            ],
            class: SETTINGS_CONSTANTS.MODAL.CONTAINER_CLASS,
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
