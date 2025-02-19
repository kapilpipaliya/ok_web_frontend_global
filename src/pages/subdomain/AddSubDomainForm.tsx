import { type Component, createSignal } from "solid-js";
import { v7 as uuidv7 } from "uuid";

import type { FieldAttribute } from "~/lib/meta/FormMetadataType";

import { PROPERTIES } from "~/components/styled/constants/constant";
import { CustomModal } from "~/components/styled/CustomModal";
import { useToast } from "~/components/styled/Toast";
import { API } from "~/lib/api/endpoints";
import { postAPI } from "~/lib/api/postApi";
import { useGraph } from "~/lib/graph/graph";
import { addNewVertex } from "~/lib/graph/mutate/vertex";

import { SchemaRenderer } from "../SchemaRenderer";

const GRID_ITEM_CLASS =
  "grid grid-template-columns:150px|400px ai:center gap:8";
const LABEL_CLASS = "color:dimgrey font-weight:500 font:15";

interface Props {
  onSuccess: () => void;
}

export const AddSubDomainForm: Component<Props> = (props) => {
  const [graph, setGraph] = useGraph();
  const { showErrorToast, showSuccessToast } = useToast();
  const [isLoading, setIsLoading] = createSignal(false);
  const [showAddModal, setShowAddModal] = createSignal(false);
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

  const handleSave = async () => {
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
      setIsLoading(true);
      const response = await postAPI(API.subdomain.createUrl, {
        domain: formData.P.domain,
        key: formData.P.key,
      });

      if (response.error) {
        showErrorToast(response.error);
      } else {
        showSuccessToast("Subdomain created successfully");
        setShowAddModal(false);
        props.onSuccess();
      }
    } catch (error) {
      showErrorToast((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const subDomainForm: FieldAttribute = {
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
            // validation: { required: true },
          },
        ],
        class: GRID_ITEM_CLASS,
        componentName: "Box",
      },
    ],
    class: "p:10 grid gap:10",
    componentName: "Box",
  };

  return (
    <>
      <button
        class="bg:primary fg:base-5 p:8|16 r:4 cursor:pointer border:none"
        onClick={() => setShowAddModal(true)}
      >
        Add New SubDomain
      </button>
      <CustomModal
        footer={(setOpen) => (
          <div class="display:flex jc:flex-end p:3 gap:6 border-top:1px|solid|#eee">
            <button
              class="bg:#f3f4f6 fg:#374151 p:8|16 r:4 cursor:pointer border:1px|solid|#e5e7eb"
              onClick={() => setOpen(false)}
            >
              Cancel
            </button>
            <button
              class="bg:primary fg:base-5 p:8|16 r:4 cursor:pointer border:none"
              disabled={isLoading()}
              onClick={handleSave}
            >
              {isLoading() ? "Saving..." : "Save"}
            </button>
          </div>
        )}
        open={showAddModal}
        setOpen={setShowAddModal}
        title="Add New SubDomain"
      >
        <SchemaRenderer
          form={{ attributes: [subDomainForm], key: "SubDomain" }}
          formDataId={formDataId}
        />
      </CustomModal>
    </>
  );
};
