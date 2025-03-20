import { createAsync } from "@solidjs/router";
import { createEffect, Show } from "solid-js";
import { createStore } from "solid-js/store";
import { v7 as uuidv7 } from "uuid";

import type { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";
import type { UserData } from "~/lib/graph/mutate/user/loadUser";
import type { FieldAttribute } from "~/lib/meta/FormMetadataType";

import { useToast } from "~/components/styled/modal/Toast";
import { API } from "~/lib/api/endpoints";
import { postAPI } from "~/lib/api/general/postApi";
import { getMemberVertex } from "~/lib/graph/get/sync/store/getMemberVertex";
import { useGraph } from "~/lib/graph/GraphContext";
import {
  addNewVertex,
  replaceVertexProperties,
} from "~/lib/graph/mutate/core/vertex";
import { validateEmail } from "~/lib/validation/validateEmail";
import { PROPERTIES, SETTINGS_CONSTANTS } from "~/pages/settings/constants";
import { getUserRPC } from "~/routes/api/auth/(user)/getUserRPC";

import { SchemaRenderer } from "../../SchemaRenderer";
import { ProfileImageSettings } from "./ProfileImageSettings";

export function ProfileSettings() {
  const [graph, setGraph] = useGraph();
  const { showErrorToast, showSuccessToast } = useToast();

  const isSystemSubDomain = () =>
    getMemberVertex(graph).P.subDomain === "super";

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
            as: "div",
            attributes: [
              {
                as: "div",
                attributes: [
                  {
                    as: "span",
                    class: "fg:base-80",
                    componentName: "Html",
                    text: "Important!",
                  },
                  {
                    as: "span",
                    class: "ml:4 mt:4px fg:base-60",
                    componentName: "Html",
                    text: "Changing your username or email will update them across all your projects.",
                  },
                ],
                class: "p:16px bg:primary-5 r:8px border:1px|solid|primary-10",
                componentName: "Html",
              },
            ],
            class: "mb:24px",
            componentName: "Html",
            props: () => ({
              hide: !isSystemSubDomain(),
            }),
          },
        ],
        componentName: "Html",
      },
      {
        as: "div",
        attributes: [
          {
            as: "span",
            class: SETTINGS_CONSTANTS.LABEL_CLASS,
            componentName: "Html",
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
        componentName: "Html",
      },
      {
        as: "div",
        attributes: [
          {
            as: "span",
            class: SETTINGS_CONSTANTS.LABEL_CLASS,
            componentName: "Html",
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
        componentName: "Html",
      },
      // {
      //   as: "div",
      //   attributes: [
      //     {
      //       as: "span",
      //       class: LABEL_CLASS,
      //       componentName: "Html",
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
      //   componentName: "Html",
      // },
      {
        as: "div",
        attributes: [
          {
            as: "div",
            attributes: [
              {
                as: "button",
                class: SETTINGS_CONSTANTS.SAVE_BUTTON_CLASS,
                componentName: "Html",
                props: (options: FunctionArgumentType) => ({
                  disabled: options.dataContext.saveState[0]?.isLoading,
                  onClick: async () => {
                    options.dataContext.saveState[1]("isLoading", true);

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

                    try {
                      const payload = {
                        email: user.P.email,
                        username: user.P.username,
                        uuid: user.P.uuid,
                      };
                      const response = await postAPI(
                        API.auth.profileUrl,
                        payload,
                      );
                      if (response.error) {
                        showErrorToast(response.error);
                      } else {
                        showSuccessToast("Profile updated successfully");
                      }
                    } finally {
                      options.dataContext.saveState[1]("isLoading", false);
                    }
                  },
                  text: options.dataContext.saveState[0]?.isLoading
                    ? "Saving..."
                    : "Save Changes",
                }),
              },
              // {
              //   as: "button",
              //   class: "bg:#f3f4f6 fg:#374151 p:8|16 r:4 cursor:pointer border:1px|solid|#e5e7eb",
              //   componentName: "Html",
              //   text: "Cancel",
              // },
            ],
            class: "flex",
            componentName: "Html",
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
    class: SETTINGS_CONSTANTS.FORM_CLASS,
    componentName: "Html",
    props: (options: FunctionArgumentType) => ({
      onUnmount: () => {
        options.revertTransactionUpToIndex(options.txnId, -1);
      },
    }),
  } as FieldAttribute;

  // Get user data and update vertex properties
  const loadUserData = createAsync(async () => {
    try {
      return await getUserRPC();
    } catch (err) {
      showErrorToast((err as Error).message);
    }
  });
  const setUserData = (user: UserData) => {
    if (user.user) {
      replaceVertexProperties(0, formDataId, graph, setGraph, user.user.P);
    }
  };
  createEffect(() => {
    const userData = loadUserData();
    if (userData) {
      setUserData(userData as UserData);
    }
  });

  return (
    <div>
      <SchemaRenderer
        form={{ attributes: [form], key: "Profile" }}
        formDataId={formDataId}
      />
      <Show when={!isSystemSubDomain()}>
        <hr class={SETTINGS_CONSTANTS.SECTION_DIVIDER_CLASS} />
        <ProfileImageSettings />
      </Show>
    </div>
  );
}
