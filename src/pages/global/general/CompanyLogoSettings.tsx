import { createMemo, createSignal } from "solid-js";
import { createStore, type SetStoreFunction } from "solid-js/store";
import { v7 as uuidv7 } from "uuid";

import type { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";
import type { FileManagerObject } from "~/features/file_manager/FileManagerContext";
import type { FieldAttribute } from "~/lib/meta/FormMetadataType";

type SaveState = {
  isLoading: boolean;
};

// Define a type for function arguments with saveState in contextData
interface SaveStateFunctionArgumentType extends FunctionArgumentType {
  contextData: {
    saveState: [SaveState, SetStoreFunction<SaveState>];
    [key: string]: unknown;
  };
}

import { useToast } from "~/components/styled/modal/Toast";
import { FilePickerModal } from "~/components/file_picker/FilePickerModal";
import { getDownloadLink } from "~/features/file_manager/sidebar/getDownloadLink";
import { API } from "~/lib/api/endpoints";
import { postAPI } from "~/lib/api/general/postApi";
import { evalExpression } from "~/lib/expression_eval";
import { getCompanyRectangularLogoVertex } from "~/lib/graph/get/sync/company/getCompanyRectangularLogoVertex";
import { getCompanySquareLogoVertex } from "~/lib/graph/get/sync/company/getCompanySquareLogoVertex";
import { getCompanyFaviconVertex } from "~/lib/graph/get/sync/company/getCompanyFaviconVertex";
import { setSelectionValue } from "~/lib/graph/mutate/selection/setSelectionValue";
import {
  rectangleLogoImage,
  SETTINGS_CONSTANTS,
  squareLogoImage,
} from "~/pages/settings/constants";

import { SchemaRenderer } from "../../SchemaRenderer";
import { addNewVertex } from "~/lib/graph/mutate/core/vertex/addNewVertex";
import { useGraph } from "~/lib/graph/context/UseGraph";

export function CompanyLogoSettings() {
  const [openRectangularDialog, setOpenRectangularDialog] = createSignal(false);
  const [openSquareDialog, setOpenSquareDialog] = createSignal(false);
  const [openFaviconDialog, setOpenFaviconDialog] = createSignal(false);
  const [graph, setGraph] = useGraph();
  const { showErrorToast, showSuccessToast } = useToast();
  let rectangularFileManagerStore: FileManagerObject;
  let squareFileManagerStore: FileManagerObject;
  let faviconFileManagerStore: FileManagerObject;

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

  // Setup for Square logo
  const companySquareLogoVertexCopy = getCompanySquareLogoVertex(graph);
  if (companySquareLogoVertexCopy?.id) {
    setSelectionValue(
      0,
      graph.vertexes[formDataId],
      graph,
      setGraph,
      { id: "", IN: {}, L: [], OUT: {}, P: { type: "CompanySquareLogo" } },
      companySquareLogoVertexCopy.id,
    );
  }

  // Setup for Favicon
  const companyFaviconVertexCopy = getCompanyFaviconVertex(graph);
  if (companyFaviconVertexCopy?.id) {
    setSelectionValue(
      0,
      graph.vertexes[formDataId],
      graph,
      setGraph,
      { id: "", IN: {}, L: [], OUT: {}, P: { type: "CompanyFavicon" } },
      companyFaviconVertexCopy.id,
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

  const onSquareFileSelected = () => {
    const selectedFile = squareFileManagerStore.gridStore?.[0].selectedRows[0];
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
        type: "CompanySquareLogo",
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

    setOpenSquareDialog(false);
  };

  const setRectangularFileManagerStore = (
    fileManagerStore_: FileManagerObject,
  ) => {
    rectangularFileManagerStore = fileManagerStore_;
  };

  const setSquareFileManagerStore = (fileManagerStore_: FileManagerObject) => {
    squareFileManagerStore = fileManagerStore_;
  };

  const onFaviconFileSelected = () => {
    const selectedFile = faviconFileManagerStore.gridStore?.[0].selectedRows[0];
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
        type: "CompanyFavicon",
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

    setOpenFaviconDialog(false);
  };

  const setFaviconFileManagerStore = (fileManagerStore_: FileManagerObject) => {
    faviconFileManagerStore = fileManagerStore_;
  };

  const form = {
    as: "div",
    attributes: [
      {
        as: "div",
        attributes: [
          {
            as: "span",
            css: SETTINGS_CONSTANTS.LABEL_CSS,
            componentName: "Html",
            text: "Rectangular Company Logo",
          },
          {
            as: "img",
            css: `return \`._id {
  cursor: pointer;
  height: 60px;
}\`;`,
            componentName: "Html",
            key: "companyLogo",
            props: () => {
              const selectedFile = rectangularCompanyLogoVertex()[0];
              return {
                onClick: () => setOpenRectangularDialog(true),
                src: getDownloadLink(selectedFile) || rectangleLogoImage,
              };
            },
          },
          {
            as: "div",
            componentName: "Html",
          },
          {
            as: "button",
            css: [
              SETTINGS_CONSTANTS.SECONDARY_BUTTON_CSS,
              `return \`._id {margin-right: auto;}\`;`,
            ],
            componentName: "Html",
            props: () => ({
              onClick: () => setOpenRectangularDialog(true),
            }),
            text: "Change Rectangular Logo",
          },
        ],
        css: SETTINGS_CONSTANTS.GRID_ITEM_NARROW_CSS,
        componentName: "Html",
      },
      {
        as: "div",
        attributes: [
          {
            as: "span",
            css: SETTINGS_CONSTANTS.LABEL_CSS,
            componentName: "Html",
            text: "Square Company Logo",
          },
          {
            as: "img",
            css: `return \`._id {
  cursor: pointer;
  height: 60px;
  width: 60px;
}\`;`,
            componentName: "Html",
            key: "companySquareLogo",
            props: () => {
              const selectedFile = squareCompanyLogoVertex()[0];
              return {
                onClick: () => setOpenSquareDialog(true),
                src: getDownloadLink(selectedFile) || squareLogoImage,
              };
            },
          },
          {
            as: "div",
            componentName: "Html",
          },
          {
            as: "button",
            css: [
              SETTINGS_CONSTANTS.SECONDARY_BUTTON_CSS,
              `return \`._id {margin-right: auto;}\`;`,
            ],
            componentName: "Html",
            props: () => ({
              onClick: () => setOpenSquareDialog(true),
            }),
            text: "Change Square Logo",
          },
        ],
        css: SETTINGS_CONSTANTS.GRID_ITEM_NARROW_CSS,
        componentName: "Html",
      },
      {
        as: "div",
        attributes: [
          {
            as: "span",
            css: SETTINGS_CONSTANTS.LABEL_CSS,
            componentName: "Html",
            text: "Company Favicon",
          },
          {
            as: "img",
            css: `return \`._id {
  cursor: pointer;
  height: 32px;
  width: 32px;
}\`;`,
            componentName: "Html",
            key: "companyFavicon",
            props: () => {
              const selectedFile = companyFaviconVertex()[0];
              return {
                onClick: () => setOpenFaviconDialog(true),
                src: getDownloadLink(selectedFile) || "/favicon.ico",
              };
            },
          },
          {
            as: "div",
            componentName: "Html",
          },
          {
            as: "button",
            css: [
              SETTINGS_CONSTANTS.SECONDARY_BUTTON_CSS,
              `return \`._id {margin-right: auto;}\`;`,
            ],
            componentName: "Html",
            props: () => ({
              onClick: () => setOpenFaviconDialog(true),
            }),
            text: "Change Favicon",
          },
        ],
        css: SETTINGS_CONSTANTS.GRID_ITEM_NARROW_CSS,
        componentName: "Html",
      },
      {
        as: "div",
        attributes: [
          {
            attributes: [
              {
                as: "button",
                css: SETTINGS_CONSTANTS.SAVE_BUTTON_CSS,
                componentName: "Html",
                props: (options: SaveStateFunctionArgumentType) => ({
                  disabled: options.contextData.saveState[0]?.isLoading,
                  onClick: async () => {
                    const rectangularLogo = rectangularCompanyLogoVertex()[0];
                    const squareLogo = squareCompanyLogoVertex()[0];
                    const favicon = companyFaviconVertex()[0];

                    if (!(rectangularLogo || squareLogo || favicon)) {
                      showErrorToast("Please select at least one company logo or favicon");
                      return;
                    }

                    try {
                      options.contextData.saveState[1]("isLoading", true);
                      const response = await postAPI(
                        API.settings.company.updateLogoUrl,
                        {
                          rectangularLogo: rectangularLogo?.id || null,
                          squareLogo: squareLogo?.id || null,
                          favicon: favicon?.id || null,
                        },
                      );

                      if (response.error) {
                        showErrorToast(response.error as string);
                      } else {
                        showSuccessToast("Company logos updated successfully");
                      }
                    } catch (error) {
                      showErrorToast((error as Error).message);
                    } finally {
                      options.contextData.saveState[1]("isLoading", false);
                    }
                  },
                  text: options.contextData.saveState[0]?.isLoading
                    ? "Saving..."
                    : "Save Changes",
                }),
              },
            ],
            componentName: "Html",
            contextName: "saveState",

            props: () => ({
              data: createStore<SaveState>({
                isLoading: false,
              }),
            }),
          },
        ],
        componentName: "Html",
      },
    ],
    css: SETTINGS_CONSTANTS.FORM_CSS,
    componentName: "Html",
    props: (options: FunctionArgumentType) => ({
      onCleanup: () => {
        options.revertTransactionUpToIndex(options.txnId, -1);
      },
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

  const squareCompanyLogoVertex = createMemo(() => {
    return (
      evalExpression("->CompanySquareLogo", {
        graph,
        setGraph,
        vertexes: [graph.vertexes[formDataId]],
      }) || []
    );
  });

  const companyFaviconVertex = createMemo(() => {
    return (
      evalExpression("->CompanyFavicon", {
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
        onFileSelected={onSquareFileSelected}
        open={openSquareDialog}
        selectedFileVertex={squareCompanyLogoVertex()}
        setFileManagerStore={setSquareFileManagerStore}
        setOpen={setOpenSquareDialog}
      />
      <FilePickerModal
        onFileSelected={onFaviconFileSelected}
        open={openFaviconDialog}
        selectedFileVertex={companyFaviconVertex()}
        setFileManagerStore={setFaviconFileManagerStore}
        setOpen={setOpenFaviconDialog}
      />
    </div>
  );
}
