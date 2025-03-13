import { createMemo, createSignal } from "solid-js";
import { createStore } from "solid-js/store";
import { v7 as uuidv7 } from "uuid";

import type { FunctionArgumentType } from "~/components/form/FieldSchemaType";
import type { FileManagerObject } from "~/features/file_manager/FileManagerContext";
import type { FieldAttribute } from "~/lib/meta/FormMetadataType";

import { useToast } from "~/components/styled/Toast";
import { FilePickerModal } from "~/features/css_editor/components/fields/textfield_with_unit/FilePickerModal";
import { getDownloadLink } from "~/features/file_manager/sidebar/getDownloadLink";
import { API } from "~/lib/api/endpoints";
import { postAPI } from "~/lib/api/postApi";
import { evalExpression } from "~/lib/expression_eval";
import { getCompanyCircularLogoVertex } from "~/lib/graph/get/sync/company/getCompanyCircularLogoVertex";
import { getCompanyRectangularLogoVertex } from "~/lib/graph/get/sync/company/getCompanyRectangularLogoVertex";
import { useGraph } from "~/lib/graph/graph";
import { addNewVertex } from "~/lib/graph/mutate/core/vertex";
import { setSelectionValue } from "~/lib/graph/mutate/selection/setSelectionValue";
import { profileImage, SETTINGS_CONSTANTS } from "~/pages/settings/constants";

import { SchemaRenderer } from "../../SchemaRenderer";

export function CompanyLogoSettings() {
  const [openRectangularDialog, setOpenRectangularDialog] = createSignal(false);
  const [openCircularDialog, setOpenCircularDialog] = createSignal(false);
  const [graph, setGraph] = useGraph();
  const { showErrorToast, showSuccessToast } = useToast();
  let rectangularFileManagerStore: FileManagerObject;
  let circularFileManagerStore: FileManagerObject;

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

  // Setup for rectangular logo
  const companyLogoVertexCopy = getCompanyRectangularLogoVertex(graph);
  if (companyLogoVertexCopy?.id) {
    setSelectionValue(
      0,
      graph.vertexes[formDataId],
      graph,
      setGraph,
      { id: "", IN: {}, L: [], OUT: {}, P: { type: "CompanyRectangularLogo" } },
      companyLogoVertexCopy.id,
    );
  }

  // Setup for circular logo
  const companyCircularLogoVertexCopy = getCompanyCircularLogoVertex(graph);
  if (companyCircularLogoVertexCopy?.id) {
    setSelectionValue(
      0,
      graph.vertexes[formDataId],
      graph,
      setGraph,
      { id: "", IN: {}, L: [], OUT: {}, P: { type: "CompanyCircularLogo" } },
      companyCircularLogoVertexCopy.id,
    );
  }

  const onRectangularFileSelected = () => {
    const selectedFile =
      rectangularFileManagerStore.gridStore?.[0].selectedRows[0];
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
        type: "CompanyRectangularLogo",
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

    setOpenRectangularDialog(false);
  };

  const onCircularFileSelected = () => {
    const selectedFile =
      circularFileManagerStore.gridStore?.[0].selectedRows[0];
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
        type: "CompanyCircularLogo",
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

    setOpenCircularDialog(false);
  };

  const setRectangularFileManagerStore = (
    fileManagerStore_: FileManagerObject,
  ) => {
    rectangularFileManagerStore = fileManagerStore_;
  };

  const setCircularFileManagerStore = (
    fileManagerStore_: FileManagerObject,
  ) => {
    circularFileManagerStore = fileManagerStore_;
  };

  const form = {
    as: "div",
    attributes: [
      {
        as: "div",
        attributes: [
          {
            class: SETTINGS_CONSTANTS.LABEL_CLASS,
            as: "span", componentName: "Html",
            text: "Rectangular Company Logo",
          },
          {
            as: "img",
            class: "cursor:pointer h:60px object-fit:cover",
            componentName: "Html",
            key: "companyLogo",
            props: () => {
              const selectedFile = rectangularCompanyLogoVertex()[0];
              return {
                onClick: () => setOpenRectangularDialog(true),
                src: getDownloadLink(selectedFile) || profileImage,
              };
            },
          },
          {
            as: "div",
            componentName: "Html",
          },
          {
            as: "button",
            class: SETTINGS_CONSTANTS.SECONDARY_BUTTON_CLASS + " mr:auto",
            componentName: "Html",
            props: () => ({
              onClick: () => setOpenRectangularDialog(true),
            }),
            text: "Change Rectangular Logo",
          },
        ],
        class: SETTINGS_CONSTANTS.GRID_ITEM_CLASS_NARROW,
        componentName: "Html",
      },
      {
        as: "div",
        attributes: [
          {
            class: SETTINGS_CONSTANTS.LABEL_CLASS,
            as: "span", componentName: "Html",
            text: "Circular Company Logo",
          },
          {
            as: "img",
            class: "cursor:pointer h:60px w:60px rounded-full object-fit:cover",
            componentName: "Html",
            key: "companyCircularLogo",
            props: () => {
              const selectedFile = circularCompanyLogoVertex()[0];
              return {
                onClick: () => setOpenCircularDialog(true),
                src: getDownloadLink(selectedFile) || profileImage,
              };
            },
          },
          {
            as: "div",
            componentName: "Html",
          },
          {
            as: "button",
            class: SETTINGS_CONSTANTS.SECONDARY_BUTTON_CLASS + " mr:auto",
            componentName: "Html",
            props: () => ({
              onClick: () => setOpenCircularDialog(true),
            }),
            text: "Change Circular Logo",
          },
        ],
        class: SETTINGS_CONSTANTS.GRID_ITEM_CLASS_NARROW,
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
                    const rectangularLogo = rectangularCompanyLogoVertex()[0];
                    const circularLogo = circularCompanyLogoVertex()[0];

                    if (!(rectangularLogo || circularLogo)) {
                      showErrorToast("Please select at least one company logo");
                      return;
                    }

                    try {
                      options.dataContext.saveState[1]("isLoading", true);
                      const response = await postAPI(
                        API.settings.company.updateLogoUrl,
                        {
                          circularLogo: circularLogo?.id || null,
                          rectangularLogo: rectangularLogo?.id || null,
                        },
                      );

                      if (response.error) {
                        showErrorToast(response.error);
                      } else {
                        showSuccessToast("Company logos updated successfully");
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
  } as FieldAttribute;

  const rectangularCompanyLogoVertex = createMemo(() => {
    return (
      evalExpression("->CompanyRectangularLogo", {
        graph,
        setGraph,
        vertexes: [graph.vertexes[formDataId]],
      }) || []
    );
  });

  const circularCompanyLogoVertex = createMemo(() => {
    return (
      evalExpression("->CompanyCircularLogo", {
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
        onFileSelected={onRectangularFileSelected}
        open={openRectangularDialog}
        selectedFileVertex={rectangularCompanyLogoVertex()}
        setFileManagerStore={setRectangularFileManagerStore}
        setOpen={setOpenRectangularDialog}
      />
      <FilePickerModal
        onFileSelected={onCircularFileSelected}
        open={openCircularDialog}
        selectedFileVertex={circularCompanyLogoVertex()}
        setFileManagerStore={setCircularFileManagerStore}
        setOpen={setOpenCircularDialog}
      />
    </div>
  );
}
