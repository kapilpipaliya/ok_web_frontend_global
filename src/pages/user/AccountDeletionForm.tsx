import { createStore } from "solid-js/store";

import type { FunctionArgumentType } from "~/components/form/FieldSchemaType";
import type { FieldAttribute } from "~/lib/meta/FormMetadataType";

import { API } from "~/lib/api/endpoints";
import { postAPI } from "~/lib/api/postApi";
import { SETTINGS_CONSTANTS } from "~/pages/settings/constants";

import { SchemaRenderer } from "../SchemaRenderer";

export function AccountDeletionForm() {
  const handleDeleteAccount = async (options: FunctionArgumentType) => {
    options.dataContext.deleteState[1]("isLoading", true);
    options.dataContext.deleteState[1]("errorMessage", "");
    options.dataContext.deleteState[1]("successMessage", "");
    options.dataContext.deleteState[1]("showConfirmDialog", false);

    try {
      const response = await postAPI(
        API.user.selfDeleteUrl,
        {}
      );

      if (response.success) {
        options.dataContext.deleteState[1](
          "successMessage",
          response.message || "Account scheduled for deletion. It will be permanently removed after 48 hours."
        );
        // Redirect to logout after successful deletion request
        setTimeout(() => {
          options.navigate(API.urls.user.logout);
        }, 3000);
      } else {
        options.dataContext.deleteState[1](
          "errorMessage",
          response.error || "Failed to schedule account for deletion. Please try again."
        );
      }
    } catch (error) {
      options.dataContext.deleteState[1](
        "errorMessage",
        "An unexpected error occurred. Please try again."
      );
      console.error("Error scheduling account deletion:", error);
    } finally {
      options.dataContext.deleteState[1]("isLoading", false);
    }
  };

  const modalHeaderSchema = {
    as: "div",
    attributes: [
      {
        class: SETTINGS_CONSTANTS.MODAL.HEADER.TEXT_CLASS,
        componentName: "Text",
        text: "Confirm Account Deletion",
      },
    ],
    class: SETTINGS_CONSTANTS.MODAL.HEADER.CLASS,
    componentName: "Box",
  };
  const modalFooterSchema = {
    as: "div",
    attributes: [
      {
        class: SETTINGS_CONSTANTS.MODAL.BUTTONS.CANCEL_CLASS,
        componentName: "Button",
        props: (options: FunctionArgumentType) => ({
          onClick: () => {
            options.dataContext.deleteState[1]("showConfirmDialog", false);
          },
          text: "Cancel"
        }),
      },
      {
        class: "bg:red-60 fg:white p:8|16 r:4 cursor:pointer",
        componentName: "Button",
        props: (options: FunctionArgumentType) => ({
          disabled: options.dataContext.deleteState[0]?.isLoading,
          onClick: () => handleDeleteAccount(options),
          text: options.dataContext.deleteState[0]?.isLoading ? "Deleting..." : "Yes, Delete My Account"
        }),
      }
    ],
    class: "d:flex jc:flex-end gap:12px",
    componentName: "Box"
  };
  const deleteAccountSchema: FieldAttribute = {
    as: "div",
    attributes: [
      {
        as: "div",
        attributes: [
          {
            as: "h1",
            class: "text:20 font:bold mb:4 color:error",
            componentName: "Html",
            text: "Delete Your Account"
          },
          {
            as: "p",
            class: "mb:4 fg:error-50",
            componentName: "Html",
            text: "Once you delete your account, all your data will be permanently removed after 48 hours. This action cannot be undone."
          },
          {
            as: "p",
            class: "mb:6 fg:error-50",
            componentName: "Html",
            text: "During the 48-hour period, you will not be able to log in to your account. If you change your mind, please contact our support team immediately."
          }
        ],
        componentName: "Box"
      },
      {
        as: "div",
        attributes: [
          {
            componentName: "Text",
            props: (options: FunctionArgumentType) => ({
              text: options.dataContext.deleteState[0]?.errorMessage,
            }),
          }
        ],
        class: "mb:4 p:12px bg:red-5 border:1px|solid|red-10 fg:red-70 r:8px",
        componentName: "Box",
        props: (options: FunctionArgumentType) => ({
          hidden: !options.dataContext.deleteState[0]?.errorMessage,
        })
      },
      {
        as: "div",
        attributes: [
          {
            componentName: "Text",
            props: (options: FunctionArgumentType) => ({
              text: options.dataContext.deleteState[0]?.successMessage,
            }),
          }
        ],
        class: "mb:4 p:12px bg:green-5 border:1px|solid|green-10 fg:green-70 r:8px",
        componentName: "Box",
        props: (options: FunctionArgumentType) => ({
          hidden: !options.dataContext.deleteState[0]?.successMessage,
        })
      },
      {
        as: "div",
        attributes: [
          {
            class: "bg:red-60 fg:white p:8|16 r:4 cursor:pointer",
            componentName: "Button",
            props: (options: FunctionArgumentType) => ({
              disabled: options.dataContext.deleteState[0]?.isLoading,
              onClick: () => {
                options.dataContext.deleteState[1]("showConfirmDialog", true);
              },
              text: "Delete Account"
            }),
          }
        ],
        class: "d:flex jc:flex-end",
        componentName: "Box"
      },
      // Confirmation Dialog
      {
        as: "div",
        attributes: [
          {
            as: "div",
            class: SETTINGS_CONSTANTS.MODAL.OVERLAY_CLASS,
            componentName: "Box",
          },
          {
            attributes: [
              {
                attributes: [
                  {
                    as: "dialog",
                    attributes: [
                      modalHeaderSchema,
                      {
                        as: "div",
                        attributes: [

                          {
                            class: "mb:4",
                            componentName: "Text",
                            text: "Are you sure you want to delete your account? This action cannot be undone."
                          },
                          {
                            class: "mb:6",
                            componentName: "Text",
                            text: "Your account will be scheduled for deletion and permanently removed after 48 hours."
                          },
                          modalFooterSchema,
                        ],
                        class: "p:24px",
                        componentName: "Box"
                      }
                    ],
                    class: SETTINGS_CONSTANTS.MODAL.CONTAINER_CLASS,
                    componentName: "Html",
                    open: true,
                    props: (options: FunctionArgumentType) => ({
                      style: {
                        "z-index": options.zIndex + 1,
                      },
                    })
                  }
                ],
                componentName: "Portal"
              }
            ],
            componentName: "ZIndex"
          }
        ],
        componentName: "Box",
        props: (options: FunctionArgumentType) => ({
          hidden: !options.dataContext.deleteState[0]?.showConfirmDialog,
        })
      }
    ],
    class: "p:24px r:8px bg:white border:1px|solid|base-10 sh:md",
    componentName: "Box"
  };

  // Main form schema with state management
  const formSchema: FieldAttribute = {
    attributes: [deleteAccountSchema],
    componentName: "Data",
    name: "deleteState",
    noRepeat: true,
    props: () => ({
      data: createStore({
        errorMessage: "",
        isLoading: false,
        showConfirmDialog: false,
        successMessage: "",
      }),
    })
  };

  return (
    <SchemaRenderer
      form={{ attributes: [formSchema], key: "AccountDeletion" }}
    />
  );
} 