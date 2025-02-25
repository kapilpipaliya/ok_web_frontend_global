import { createSignal } from "solid-js";
import { createStore } from "solid-js/store";
import { v7 as uuidv7 } from "uuid";

import type { FunctionArgumentType } from "~/components/form/FieldSchemaType";
import { PROPERTIES } from "~/components/styled/constants/constant";
import { useToast } from "~/components/styled/Toast";
import { useGraph } from "~/lib/graph/graph";
import { addNewVertex } from "~/lib/graph/mutate/vertex";
import { wrapFormInCard } from "~/lib/utils/formWrapper";
import { validatePassword } from "~/lib/validation/validatePassword";

import { SchemaRenderer } from "../SchemaRenderer";
import { SETTINGS_CONSTANTS } from "../settings/constants";

export function ForgotPasswordForm() {
  const [graph, setGraph] = useGraph();
  const { showErrorToast, showLoadingToast } = useToast();
  const [stage, setStage] = createSignal(0); // 0: Email, 1: OTP, 2: New Passwords
  const [showPassword, setShowPassword] = createStore({
    confirmPassword: false,
    newPassword: false,
  });

  const formDataId = uuidv7();
  addNewVertex(
    0,
    {
      id: formDataId,
      IN: {},
      L: ["ForgotPassword"],
      OUT: {},
      P: {},
    },
    graph,
    setGraph,
  );

  const handleEmailSubmit = async (formData: any) => {
    const { email } = formData.P;
    if (!email?.trim()) {
      showErrorToast("Enter email");
      return;
    }
    // Todo: This function should not be called from frontend side.
    //   await sendEmail({
    //     content: "Reset Password",
    //     subDomain: subDomain,
    //     subject: "Reset Password",
    //     to: email,
    //   });
    //   setStage(1);
  };

  const handleOtpSubmit = (formData: any) => {
    const { otp } = formData.P;
    if (!otp?.trim()) {
      showErrorToast("Please enter OTP");
      return;
    }
    setStage(2);
  };

  const handlePasswordResetSubmit = (formData: any) => {
    const { confirmPassword, newPassword } = formData.P;

    if (newPassword !== confirmPassword) {
      showErrorToast("Passwords do not match");
      return;
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      showErrorToast(passwordError);
      return;
    }

    showErrorToast("Password has been reset successfully");
  };

  const getFormByStage = () => {
    switch (stage()) {
      case 0:
        return {
          as: "div",
          attributes: [
            {
              as: "div",
              attributes: [
                {
                  class: SETTINGS_CONSTANTS.LABEL_CLASS,
                  componentName: "Text",
                  text: "Email",
                },
                {
                  class: PROPERTIES.Css.TextField,
                  componentName: "TextInput",
                  key: "email",
                  validation: { required: true },
                },
              ],
              class: SETTINGS_CONSTANTS.FORM_GRID_CLASS,
              componentName: "Box",
            },
            {
              attributes: [
                {
                  as: "button",
                  class:
                    "bg:primary fg:base-5 p:8|16 r:4 cursor:pointer border:none mr:8 w:100%",
                  componentName: "Box",
                  props: (options: FunctionArgumentType) => ({
                    disabled: options.dataContext.submitState[0]?.isLoading,
                    onClick: async () => {
                      try {
                        options.dataContext.submitState[1]("isLoading", true);
                        const formData = graph.vertexes[formDataId];
                        await handleEmailSubmit(formData);
                      } finally {
                        options.dataContext.submitState[1]("isLoading", false);
                      }
                    },
                    text: options.dataContext.submitState[0]?.isLoading
                      ? "Sending..."
                      : "Confirm",
                  }),
                },
              ],
              componentName: "Data",
              name: "submitState",
              noRepeat: true,
              props: () => ({
                data: createStore({
                  isLoading: false,
                }),
              }),
            },
          ],
          class: SETTINGS_CONSTANTS.FORM_CLASS,
          componentName: "Box",
        };

      case 1:
        return {
          as: "div",
          attributes: [
            {
              as: "div",
              attributes: [
                {
                  class: SETTINGS_CONSTANTS.LABEL_CLASS,
                  componentName: "Text",
                  text: "One Time Password (OTP)",
                },
                {
                  class: PROPERTIES.Css.TextField,
                  componentName: "TextInput",
                  key: "otp",
                  props: () => ({
                    maxLength: 6,
                  }),
                  validation: { required: true },
                },
              ],
              class: SETTINGS_CONSTANTS.FORM_GRID_CLASS,
              componentName: "Box",
            },
            {
              attributes: [
                {
                  as: "button",
                  class:
                    "bg:primary fg:base-5 p:8|16 r:4 cursor:pointer border:none mr:8 w:100%",
                  componentName: "Box",
                  props: (options: FunctionArgumentType) => ({
                    disabled: options.dataContext.submitState[0]?.isLoading,
                    onClick: async () => {
                      try {
                        options.dataContext.submitState[1]("isLoading", true);
                        const formData = graph.vertexes[formDataId];
                        handleOtpSubmit(formData);
                      } finally {
                        options.dataContext.submitState[1]("isLoading", false);
                      }
                    },
                    text: options.dataContext.submitState[0]?.isLoading
                      ? "Verifying..."
                      : "Submit",
                  }),
                },
              ],
              componentName: "Data",
              name: "submitState",
              noRepeat: true,
              props: () => ({
                data: createStore({
                  isLoading: false,
                }),
              }),
            },
          ],
          class: SETTINGS_CONSTANTS.FORM_CLASS,
          componentName: "Box",
        };

      case 2:
        return {
          as: "div",
          attributes: [
            {
              as: "div",
              attributes: [
                {
                  class: SETTINGS_CONSTANTS.LABEL_CLASS,
                  componentName: "Text",
                  text: "New Password",
                },
                {
                  as: "div",
                  attributes: [
                    {
                      class: PROPERTIES.Css.TextField,
                      componentName: "TextInput",
                      key: "newPassword",
                      props: () => ({
                        type: showPassword.newPassword ? "text" : "password",
                      }),
                      validation: { required: true },
                    },
                    {
                      as: "div",
                      attributes: [
                        {
                          componentName: "Icon",
                          props: () => ({
                            icon: showPassword.newPassword
                              ? "ph:eye"
                              : "ph:eye-slash",
                            onClick: () =>
                              setShowPassword(
                                "newPassword",
                                !showPassword.newPassword,
                              ),
                          }),
                        },
                      ],
                      class:
                        "position:abs right:10px top:50% transform:translateY(-50%) cursor:pointer",
                      componentName: "Box",
                    },
                  ],
                  class: "position:rel",
                  componentName: "Box",
                },
              ],
              class: SETTINGS_CONSTANTS.FORM_GRID_CLASS,
              componentName: "Box",
            },
            {
              as: "div",
              attributes: [
                {
                  class: SETTINGS_CONSTANTS.LABEL_CLASS,
                  componentName: "Text",
                  text: "Confirm Password",
                },
                {
                  as: "div",
                  attributes: [
                    {
                      class: PROPERTIES.Css.TextField,
                      componentName: "TextInput",
                      key: "confirmPassword",
                      props: () => ({
                        type: showPassword.confirmPassword
                          ? "text"
                          : "password",
                      }),
                      validation: { required: true },
                    },
                    {
                      as: "div",
                      attributes: [
                        {
                          componentName: "Icon",
                          props: () => ({
                            icon: showPassword.confirmPassword
                              ? "ph:eye"
                              : "ph:eye-slash",
                            onClick: () =>
                              setShowPassword(
                                "confirmPassword",
                                !showPassword.confirmPassword,
                              ),
                          }),
                        },
                      ],
                      class:
                        "position:abs right:10px top:50% transform:translateY(-50%) cursor:pointer",
                      componentName: "Box",
                    },
                  ],
                  class: "position:rel",
                  componentName: "Box",
                },
              ],
              class: SETTINGS_CONSTANTS.FORM_GRID_CLASS,
              componentName: "Box",
            },
            {
              attributes: [
                {
                  as: "button",
                  class:
                    "bg:primary fg:base-5 p:8|16 r:4 cursor:pointer border:none mr:8 w:100%",
                  componentName: "Box",
                  props: (options: FunctionArgumentType) => ({
                    disabled: options.dataContext.submitState[0]?.isLoading,
                    onClick: async () => {
                      try {
                        options.dataContext.submitState[1]("isLoading", true);
                        const formData = graph.vertexes[formDataId];
                        handlePasswordResetSubmit(formData);
                      } finally {
                        options.dataContext.submitState[1]("isLoading", false);
                      }
                    },
                    text: options.dataContext.submitState[0]?.isLoading
                      ? "Resetting..."
                      : "Confirm",
                  }),
                },
              ],
              componentName: "Data",
              name: "submitState",
              noRepeat: true,
              props: () => ({
                data: createStore({
                  isLoading: false,
                }),
              }),
            },
          ],
          class: SETTINGS_CONSTANTS.FORM_CLASS,
          componentName: "Box",
        };
    }
  };

  const form = {
    attributes: [
      getFormByStage(),
      {
        as: "div",
        attributes: [
          {
            class: "color:grey",
            componentName: "Text",
            text: "Already have an account? ",
          },
          {
            as: "a",
            class: "color:primary text-decoration:none font-weight:bold",
            componentName: "Box",
            props: () => ({
              href: "/auth/login",
            }),
            text: "Sign In",
          },
        ],
        class: "text-align:center mt:16",
        componentName: "Box",
      },
      {
        as: "div",
        attributes: [
          {
            class: "color:grey",
            componentName: "Text",
            text: "Don't have an account? ",
          },
          {
            as: "a",
            class: "color:primary text-decoration:none font-weight:bold",
            componentName: "Box",
            props: () => ({
              href: "/auth/signup",
            }),
            text: "Sign Up",
          },
        ],
        class: "text-align:center mt:8",
        componentName: "Box",
      },
    ],
    componentName: "Box",
  };

  return (
    <SchemaRenderer
      form={{ attributes: [wrapFormInCard(form)], key: "ForgotPassword" }}
      formDataId={formDataId}
    />
  );
}
