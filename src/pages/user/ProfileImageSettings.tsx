import { createMemo, createSignal } from "solid-js";
import { v7 as uuidv7 } from "uuid";

import type { FileManagerObject } from "~/features/file_manager/FileManagerContext";
import type { FieldAttribute } from "~/lib/meta/FormMetadataType";

import { FilePickerModal } from "~/components/css_properties/components/fields/textfield_with_unit/FilePickerModal";
import { useToast } from "~/components/styled/Toast";
import { getDownloadLink } from "~/features/file_manager/sidebar/getDownloadLink";
import { API } from "~/lib/api/endpoints";
import { postAPI } from "~/lib/api/postApi";
import { evalExpression } from "~/lib/expression_eval";
import {
  getMemberVertex,
  getProfileImageVertex,
} from "~/lib/graph/get/sync/getMemberVertex";
import { useGraph } from "~/lib/graph/graph";
import { setSelectionValue } from "~/lib/graph/mutate/setSelectionValue";
import { addNewVertex } from "~/lib/graph/mutate/vertex";
import { profileImage } from "~/pages/admin_layout/constants/constant";

import { SchemaRenderer } from "../SchemaRenderer";
import { SETTINGS_CONSTANTS } from "~/pages/settings/constants";

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

  const onSave = async () => {
    const selectedFile = profileImageVertex()[0];
    if (!selectedFile) {
      showErrorToast("Please select a profile image first");
      return;
    }

    const memberVertex = getMemberVertex(graph);
    const response = await postAPI(API.updateProfileImageUrl, {
      profileImage: selectedFile.id,
      uuid: memberVertex.P.uuid,
    });

    if (response.error) {
      showErrorToast(response.error);
    } else {
      showSuccessToast("Profile image updated successfully");
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
