import { createMemo, createSignal } from "solid-js";
import { v7 as uuidv7 } from "uuid";

import type { FieldAttribute } from "~/lib/meta/FormMetadataType";
import type { FileManagerObject } from "~/pages/file_manager/FileManagerContext";

import { FilePickerModal } from "~/components/css_properties/components/fields/textfield_with_unit/FilePickerModal";
import { PROPERTIES } from "~/components/styled/constants/constant";
import { useToast } from "~/components/styled/Toast";
import { API } from "~/lib/api/endpoints";
import { getAPI } from "~/lib/api/getApi";
import { postAPI } from "~/lib/api/postApi";
import { evalExpression } from "~/lib/expression_eval";
import { useGraph, Vertex } from "~/lib/graph/graph";
import { setSelectionValue } from "~/lib/graph/mutate/setSelectionValue";
import { addNewVertex, replaceVertexProperties } from "~/lib/graph/mutate/vertex";
import { profileImage } from "~/pages/admin_layout/constant";
import { getDownloadLink } from "~/pages/file_manager/sidebar/getDownloadLink";

import { SchemaRenderer } from "./SchemaRenderer";
import { validateEmail } from "~/lib/validation/validateEmail";

export function ProfileSettings() {
  const GRID_ITEM_CLASS = "grid grid-template-columns:150px|500px ai:center gap:8";
  const LABEL_CLASS = "color:dimgrey font-weight:500 font:15";
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
            class: LABEL_CLASS,
            componentName: "Text",
            text: "Profile Image",
          },
          // {
          //   collection: "g:'File'",
          //   componentName: "Select",
          //   key: "ProfileImage",
          //   label: "File",
          //   labelKey: "::'P.fileName'",
          //   title: "Profile Image",
          // },
          {
            as: "img",
            class: "cursor:pointer h:60px object-fit:cover",
            componentName: "Box",
            key: "profileImage",
            props: () => {
              const selectedFile = profileImageVertex()[0];
              console.log(selectedFile);
              return ({
                onClick: () => setOpenDialog(true),
                src: getDownloadLink(selectedFile) || profileImage,
              });
            },
          },
          {
            as: "div",
            componentName: "Box"
          },
          {
            as: "button",
            class: "bg:primary fg:white p:8|16 r:4 cursor:pointer border:none mr:8",
            componentName: "Box",
            props: () => ({
              onClick: () => setOpenDialog(true),
            }),
            text: "Select Image",
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
            text: "Username",
            validation: { required: true },
          },
          {
            class: PROPERTIES.Css.TextField,
            componentName: "TextInput",
            key: "username",
            placeholder: "Username",
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
            key: "emailLabel",
            text: "Email Address",
          },
          {
            class: PROPERTIES.Css.TextField,
            componentName: "TextInput",
            key: "email",
            placeholder: "Email Address",
            type: "email",
            validation: { required: true }, // TODO: Add email validation
          },
        ],
        class: GRID_ITEM_CLASS,
        componentName: "Box",
      },
      // {
      //   as: "div",
      //   attributes: [
      //     {
      //       as: "span",
      //       class: LABEL_CLASS,
      //       componentName: "Box",
      //       text: "Country"
      //     },
      //     {
      //       class: "border:1px|solid|#ccc p:5|10 r:4",
      //       componentName: "Select",
      //       key: "country",
      //       options: [
      //         { text: "United States", value: "United States" },
      //         { text: "Canada", value: "Canada" },
      //         { text: "United Kingdom", value: "United Kingdom" },
      //       ],
      //     },
      //   ],
      //   class: GRID_ITEM_CLASS,
      //   componentName: "Box",
      // },
      {
        as: "div",
        attributes: [
          {
            as: "button",
            class: "bg:primary fg:white p:8|16 r:4 cursor:pointer border:none mr:8",
            componentName: "Box",
            props: () => ({
              onClick: async () => {
                // TODO: Run Form Validation
                const user = graph.vertexes[formDataId];

                if (!user.P.username.trim()) {
                  showErrorToast("Please enter username");
                  return;
                }
            
                if (!user.P.email.trim()) {
                  showErrorToast("Please enter email");
                  return;
                }
            
                if (validateEmail(user.P.email)) {
                  showErrorToast("Please enter a valid email");
                  return;
                }
                
                const payload = {
                  email: user.P.email,
                  profileImage: profileImageVertex()[0]?.id,
                  username: user.P.username,
                  uuid: user.P.uuid,
                };
                const response = await postAPI(API.profileUrl, payload);
                if (response.error) {
                  showErrorToast(response.error);
                } else {
                  showSuccessToast("Profile updated successfully");
                  setTimeout(() => {
                    window.location.reload();
                  }, 1500);
                }
              },
            }),
            text: "Save Changes",
          },
          {
            as: "button",
            class: "bg:#f3f4f6 fg:#374151 p:8|16 r:4 cursor:pointer border:1px|solid|#e5e7eb",
            componentName: "Box",
            text: "Cancel",
          },
        ],
        class: "mt:24 flex",
        componentName: "Box",
      },
    ],
    class: "p:10 grid gap:10",
    componentName: "Box",
  } as FieldAttribute;

  // Get user data and update vertex properties
  const loadUserData = async () => {
    try {
      const data = await getAPI(API.getUserUrl);
      const user = data.user;

      replaceVertexProperties(0, formDataId, graph, setGraph, user.P);

      // Create profile image vertex and edge if exists
      if (data.profileImage) {
        if (!data.profileImage.id) {
          addNewVertex(
            0,
            data.profileImage,
            graph,
            setGraph,
          );
        }
        setSelectionValue(
          0,
          graph.vertexes[formDataId],
          graph,
          setGraph,
          { id: "", IN: {}, L: [], OUT: {}, P: { type: "UserProfileImage" } },
          data.profileImage.id
        );
      }

    } catch (err) {
      showErrorToast((err as Error).message);
    }
  };

  loadUserData();

  const profileImageVertex = createMemo((): Vertex[] => {
    return (
      evalExpression(
        `->$0ProfileImage`,
        { graph, setGraph, vertexes: [graph.vertexes[formDataId]] },
      ) || []
    );
  });

  return (
    <div>
      <SchemaRenderer form={{ attributes: [form], key: "Profile" }} formDataId={formDataId} />
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
