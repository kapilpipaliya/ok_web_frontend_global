import { v7 as uuidv7 } from "uuid";

import type { FieldAttribute } from "~/lib/meta/FormMetadataType";

import { PROPERTIES } from "~/components/styled/constants/constant";
import { useToast } from "~/components/styled/Toast";
import { API } from "~/lib/api/endpoints";
import { getAPI } from "~/lib/api/getApi";
import { postAPI } from "~/lib/api/postApi";
import { useGraph } from "~/lib/graph/graph";
import { setSelectionValue } from "~/lib/graph/mutate/setSelectionValue";
import {
  addNewVertex,
  replaceVertexProperties,
} from "~/lib/graph/mutate/vertex";
import { validateEmail } from "~/lib/validation/validateEmail";
import { SETTINGS_CONSTANTS } from "~/pages/settings/constants";

import { SchemaRenderer } from "../SchemaRenderer";
import { ProfileImageSettings } from "./ProfileImageSettings";

export function ProfileSettings() {
  const [graph, setGraph] = useGraph();
  const { showErrorToast, showSuccessToast } = useToast();

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

  const form = {
    as: "div",
    attributes: [
      {
        as: "div",
        attributes: [
          {
            class: SETTINGS_CONSTANTS.LABEL_CLASS,
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
        class: SETTINGS_CONSTANTS.GRID_ITEM_CLASS_NARROW,
        componentName: "Box",
      },
      {
        as: "div",
        attributes: [
          {
            class: SETTINGS_CONSTANTS.LABEL_CLASS,
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
        class: SETTINGS_CONSTANTS.GRID_ITEM_CLASS_NARROW,
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
      //       class: "",
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
            class: SETTINGS_CONSTANTS.SAVE_BUTTON_CLASS,
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
                  username: user.P.username,
                  uuid: user.P.uuid,
                };
                const response = await postAPI(API.auth.profileUrl, payload);
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
          // {
          //   as: "button",
          //   class: "bg:#f3f4f6 fg:#374151 p:8|16 r:4 cursor:pointer border:1px|solid|#e5e7eb",
          //   componentName: "Box",
          //   text: "Cancel",
          // },
        ],
        class: "mt:24 flex",
        componentName: "Box",
      },
    ],
    class: SETTINGS_CONSTANTS.FORM_CLASS,
    componentName: "Box",
  } as FieldAttribute;

  // Get user data and update vertex properties
  const loadUserData = async () => {
    try {
      const data = await getAPI(API.auth.getUserUrl);
      const user = data.user;

      replaceVertexProperties(0, formDataId, graph, setGraph, user.P);

      // Create profile image vertex and edge if exists
      if (data.profileImage) {
        if (!graph.vertexes[data.profileImage.id]) {
          addNewVertex(0, data.profileImage, graph, setGraph);
        }
        setSelectionValue(
          0,
          graph.vertexes[formDataId],
          graph,
          setGraph,
          { id: "", IN: {}, L: [], OUT: {}, P: { type: "UserProfileImage" } },
          data.profileImage.id,
        );
      }
    } catch (err) {
      showErrorToast((err as Error).message);
    }
  };

  loadUserData();

  return (
    <div>
      <SchemaRenderer
        form={{ attributes: [form], key: "Profile" }}
        formDataId={formDataId}
      />
      <hr class={SETTINGS_CONSTANTS.SECTION_DIVIDER_CLASS} />
      <ProfileImageSettings />
    </div>
  );
}
