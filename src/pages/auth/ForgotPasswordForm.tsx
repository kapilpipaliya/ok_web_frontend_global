import { createSignal } from "solid-js";
import { createStore } from "solid-js/store";
import { v7 as uuidv7 } from "uuid";

import { PROPERTIES } from "~/components/styled/constants/constant";
import { useToast } from "~/components/styled/Toast";
import { useGraph } from "~/lib/graph/graph";
import { addNewVertex } from "~/lib/graph/mutate/vertex";
import { wrapFormInCard } from "~/lib/utils/formWrapper";
import { validatePassword } from "~/lib/validation/validatePassword";
import { sendEmail } from "~/server/email/sendEmail";

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
    await sendEmail(email, "Reset Password");
    setStage(1);
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
              as: "div",
              attributes: [
                {
                  as: "button",
                  class:
                    "bg:primary fg:base-5 p:8|16 r:4 cursor:pointer border:none mr:8 w:100%",
                  componentName: "Box",
                  props: () => ({
                    onClick: async () => {
                      const formData = graph.vertexes[formDataId];
                      await handleEmailSubmit(formData);
                    },
                  }),
                  text: "Confirm",
                },
              ],
              class: "",
              componentName: "Box",
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
              as: "div",
              attributes: [
                {
                  as: "button",
                  class:
                    "bg:primary fg:base-5 p:8|16 r:4 cursor:pointer border:none mr:8 w:100%",
                  componentName: "Box",
                  props: () => ({
                    onClick: () => {
                      const formData = graph.vertexes[formDataId];
                      handleOtpSubmit(formData);
                    },
                  }),
                  text: "Submit",
                },
              ],
              class: "",
              componentName: "Box",
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
              as: "div",
              attributes: [
                {
                  as: "button",
                  class:
                    "bg:primary fg:base-5 p:8|16 r:4 cursor:pointer border:none mr:8 w:100%",
                  componentName: "Box",
                  props: () => ({
                    onClick: () => {
                      const formData = graph.vertexes[formDataId];
                      handlePasswordResetSubmit(formData);
                    },
                  }),
                  text: "Confirm",
                },
              ],
              class: "",
              componentName: "Box",
            },
          ],
          class: SETTINGS_CONSTANTS.FORM_CLASS,
          componentName: "Box",
        };
    }
  };

  const form = {
    attributes: [getFormByStage()],
    componentName: "Box",
  };

  return (
    <SchemaRenderer
      form={{ attributes: [wrapFormInCard(form)], key: "ForgotPassword" }}
      formDataId={formDataId}
    />
  );
}
