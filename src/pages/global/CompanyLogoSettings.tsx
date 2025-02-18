import { createMemo, createSignal } from "solid-js";
import { v7 as uuidv7 } from "uuid";

import type { FileManagerObject } from "~/features/file_manager/FileManagerContext";

import { FilePickerModal } from "~/features/css_editor/components/fields/textfield_with_unit/FilePickerModal";
import { useToast } from "~/components/styled/Toast";
import { getDownloadLink } from "~/features/file_manager/sidebar/getDownloadLink";
import { API } from "~/lib/api/endpoints";
import { postAPI } from "~/lib/api/postApi";
import { evalExpression } from "~/lib/expression_eval";
import { getCompanyLogoVertex } from "~/lib/graph/get/sync/getMemberVertex";
import { useGraph } from "~/lib/graph/graph";
import { setSelectionValue } from "~/lib/graph/mutate/setSelectionValue";
import { addNewVertex } from "~/lib/graph/mutate/vertex";
import { defaultLogo } from "~/pages/constants/constant";

import { SchemaRenderer } from "../SchemaRenderer";
import { SETTINGS_CONSTANTS } from "~/pages/settings/constants";

export function CompanyLogoSettings() {
  const [openDialog, setOpenDialog] = createSignal(false);
  const [graph, setGraph] = useGraph();
  const { showErrorToast, showSuccessToast } = useToast();
  let fileManagerStore: FileManagerObject;

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
  const companyLogoVertexCopy = getCompanyLogoVertex(graph);
  if (companyLogoVertexCopy?.id) {
    setSelectionValue(
      0,
      graph.vertexes[formDataId],
      graph,
      setGraph,
      { id: "", IN: {}, L: [], OUT: {}, P: { type: "CompanyLogo" } },
      companyLogoVertexCopy.id,
    );
  }

  const onFileSelected = () => {
    const selectedFile = fileManagerStore.gridStore?.[0].selectedRows[0];
    if (!selectedFile) {
      showErrorToast("Please select a file");
      return;
    }

    const selectedFileMetaVertex = {
      id: "",
      IN: {},
      L: [],
      OUT: {},
      P: {
        type: "CompanyLogo",
      },
    };

    setSelectionValue(
      0,
      graph.vertexes[formDataId],
      graph,
      setGraph,
      selectedFileMetaVertex,
      selectedFile.id,
    );

    setOpenDialog(false);
  };

  const onSave = async () => {
    const selectedFile = companyLogoVertex()[0];
    if (!selectedFile) {
      showErrorToast("Please select a company logo first");
      return;
    }

    const response = await postAPI(API.updateCompanyLogoUrl, {
      logoImage: selectedFile.id,
    });

    if (response.error) {
      showErrorToast(response.error);
    } else {
      showSuccessToast("Company logo updated successfully");
    }
  };

  const setFileManagerStore = (fileManagerStore_: FileManagerObject) => {
    fileManagerStore = fileManagerStore_;
  };

  const form = {
    as: "div",
    attributes: [
      {
        as: "div",
        attributes: [
          {
            class: SETTINGS_CONSTANTS.LABEL_CLASS,
            componentName: "Text",
            text: "Company Logo",
          },
          {
            as: "img",
            class: "cursor:pointer h:60px object-fit:cover",
            componentName: "Box",
            key: "companyLogo",
            props: () => {
              const selectedFile = companyLogoVertex()[0];
              return {
                onClick: () => setOpenDialog(true),
                src: getDownloadLink(selectedFile) || defaultLogo,
              };
            },
          },
          {
            as: "div",
            componentName: "Box",
          },
          {
            as: "button",
            class: SETTINGS_CONSTANTS.SECONDARY_BUTTON_CLASS + " mr:auto",
            componentName: "Box",
            props: () => ({
              onClick: () => setOpenDialog(true),
            }),
            text: "Change Company Logo",
          },
          {
            as: "button",
            class: SETTINGS_CONSTANTS.SAVE_BUTTON_CLASS,
            componentName: "Box",
            props: () => ({
              onClick: onSave,
            }),
            text: "Save Changes",
          },
        ],
        class: SETTINGS_CONSTANTS.GRID_ITEM_CLASS_NARROW,
        componentName: "Box",
      },
    ],
    class: SETTINGS_CONSTANTS.FORM_CLASS,
    componentName: "Box",
  };

  const companyLogoVertex = createMemo(() => {
    return (
      evalExpression("->CompanyLogo", {
        graph,
        setGraph,
        vertexes: [graph.vertexes[formDataId]],
      }) || []
    );
  });

  return (
    <div>
      <SchemaRenderer
        form={{ attributes: [form], key: "CompanyLogo" }}
        formDataId={formDataId}
      />
      <FilePickerModal
        onFileSelected={onFileSelected}
        open={openDialog}
        selectedFileVertex={companyLogoVertex()}
        setFileManagerStore={setFileManagerStore}
        setOpen={setOpenDialog}
      />
    </div>
  );
}
