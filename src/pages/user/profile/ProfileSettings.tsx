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
import { css } from "~/lib/styles";
import { As } from "~/components/As";

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
                    css: css`
  color: \${args.theme.var.color.base};
`,
                    componentName: "Html",
                    text: "Important!",
                  },
                  {
                    as: "span",
                    css: css`
  margin-left: 4px;
  margin-top: 4px;
  color: \${args.theme.var.color.base};
`,
                    componentName: "Html",
                    text: "Changing your username or email will update them across all your projects.",
                  },
                ],
                css: css`
  padding: 16px;
  background-color: \${args.theme.var.color.primary_20};
  border-radius: 8px;
  border: 1px solid \${args.theme.var.color.primary_40};
`,
                componentName: "Html",
              },
            ],
            css: css`
  margin-bottom: 24px;
`,
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
            css: SETTINGS_CONSTANTS.LABEL_CSS,
            componentName: "Html",
            text: "Username",
            validation: { required: true },
          },
          {
            css: PROPERTIES.Css.TextFieldCss,
            componentName: "TextInput",
            key: "username",
            placeholder: "Username",
            validation: { required: true },
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
            key: "emailLabel",
            text: "Email Address",
          },
          {
            css: PROPERTIES.Css.TextFieldCss,
            componentName: "TextInput",
            key: "email",
            placeholder: "Email Address",
            type: "email",
            validation: { required: true }, // TODO: Add email validation
          },
        ],
        css: SETTINGS_CONSTANTS.GRID_ITEM_NARROW_CSS,
        componentName: "Html",
      },
      // {
      //   as: "div",
      //   attributes: [
      //     {
      //       as: "span",
      //       css: SETTINGS_CONSTANTS.LABEL_CSS,
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
      //   css: SETTINGS_CONSTANTS.GRID_ITEM_CSS,
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
                css: SETTINGS_CONSTANTS.SAVE_BUTTON_CSS,
                componentName: "Html",
                props: (options: FunctionArgumentType) => ({
                  disabled: options.dataContext.saveState[0]?.isLoading,
                  onClick: async () => {
                    options.dataContext.saveState[1]("isLoading", true);

                    // TODO: Run Form Validation
                    const user = graph.vertexes[formDataId];

                    if (!user.P.username.trim) {
                      showErrorToast("Please enter username");
                      return;
                    }

                    if (!user.P.email.trim) {
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
              //                 css: css`
              //   background-color: #f3f4f6;
              //   color: #374151;
              //   padding: 8px 16px;
              //   border-radius: 4px;
              //   cursor: pointer;
              //   border: 1px solid #3b82f6;
              // `,
              //   componentName: "Html",
              //   text: "Cancel",
              // },
            ],
            css: css`
  display: flex;
`,
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
    css: SETTINGS_CONSTANTS.FORM_CSS,
    componentName: "Html",
    props: (options: FunctionArgumentType) => ({
      onUnmount: () => {
        options.revertTransactionUpToIndex(options.txnId, -1);
      },
    }),
  } as FieldAttribute;

  // Get user data and update vertex properties
  const loadUserData = createAsync(
    async () => {
      try {
        return await getUserRPC();
      } catch (err) {
        showErrorToast((err as Error).message);
      }
    },
    { deferStream: true },
  );
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
        <As as="hr" css={SETTINGS_CONSTANTS.SECTION_DIVIDER_CSS} />
        <ProfileImageSettings />
      </Show>
    </div>
  );
}
