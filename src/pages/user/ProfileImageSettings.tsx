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
import {
  getMemberVertex,
  getProfileImageVertex,
} from "~/lib/graph/get/sync/user/getMemberVertex";
import { useGraph } from "~/lib/graph/graph";
import { addNewVertex } from "~/lib/graph/mutate/core/vertex";
import { setSelectionValue } from "~/lib/graph/mutate/selection/setSelectionValue";
import { profileImage, SETTINGS_CONSTANTS } from "~/pages/settings/constants";

import { SchemaRenderer } from "../SchemaRenderer";

export function ProfileImageSettings() {
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
      L: ["User"],
      OUT: {},
      P: {},
    },
    graph,
    setGraph,
  );
  const profileImageVertexCopy = getProfileImageVertex(graph);
  if (profileImageVertexCopy?.id) {
    setSelectionValue(
      0,
      graph.vertexes[formDataId],
      graph,
      setGraph,
      { id: "", IN: {}, L: [], OUT: {}, P: { type: "UserProfileImage" } },
      profileImageVertexCopy.id,
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
        type: "UserProfileImage",
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
            text: "Profile Image",
          },
          {
            as: "img",
            class: "cursor:pointer h:60px object-fit:cover",
            componentName: "Box",
            key: "profileImage",
            props: () => {
              const selectedFile = profileImageVertex()[0];
              return {
                onClick: () => setOpenDialog(true),
                src: getDownloadLink(selectedFile) || profileImage,
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
            text: "Change Profile Image",
          },
          {
            attributes: [
              {
                as: "button",
                class: SETTINGS_CONSTANTS.SAVE_BUTTON_CLASS,
                componentName: "Box",
                props: (options: FunctionArgumentType) => ({
                  disabled: options.dataContext.saveState[0]?.isLoading,
                  onClick: async () => {
                    const selectedFile = profileImageVertex()[0];
                    if (!selectedFile) {
                      showErrorToast("Please select a profile image first");
                      return;
                    }

                    try {
                      options.dataContext.saveState[1]("isLoading", true);
                      const memberVertex = getMemberVertex(graph);
                      const response = await postAPI(
                        API.auth.updateProfileImageUrl,
                        {
                          profileImage: selectedFile.id,
                          uuid: memberVertex.P.uuid,
                        },
                      );

                      if (response.error) {
                        showErrorToast(response.error);
                      } else {
                        showSuccessToast("Profile image updated successfully");
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
        class: SETTINGS_CONSTANTS.GRID_ITEM_CLASS_NARROW,
        componentName: "Box",
        props: () => ({
          // TODO: if not saved, revert to previous state
          // onUnmount: () => {
          //   options.revertTransactionUpToIndex(options.txnId, -1);
          // }
        }),
      },
    ],
    class: SETTINGS_CONSTANTS.FORM_CLASS,
    componentName: "Box",
  } as FieldAttribute;

  const profileImageVertex = createMemo(() => {
    return (
      evalExpression("->$0ProfileImage", {
        graph,
        setGraph,
        vertexes: [graph.vertexes[formDataId]],
      }) || []
    );
  });

  return (
    <div>
      <SchemaRenderer
        form={{ attributes: [form], key: "ProfileImage" }}
        formDataId={formDataId}
      />
      <FilePickerModal
        onFileSelected={onFileSelected}
        open={openDialog}
        selectedFileVertex={profileImageVertex()}
        setFileManagerStore={setFileManagerStore}
        setOpen={setOpenDialog}
      />
    </div>
  );
}
