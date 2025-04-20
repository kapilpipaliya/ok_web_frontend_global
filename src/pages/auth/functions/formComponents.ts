import type { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";

import { getErrorSchema } from "~/lib/schema/getErrorSchema";
import { css } from "~/lib/styles";
import {
  PROPERTIES,
  SETTINGS_CONSTANTS,
  STYLES,
} from "~/pages/settings/constants";
import { getLogoSchema } from "~/routes/internal/page/(email)/baseEmailTemplate";

/**
 * Creates a form header with logo and title
 * @param title - Form title
 * @returns Form header schema
 */
export function createFormHeader(title: string) {
  return [
    getLogoSchema(css`display:grid; place-items:center;`, css`height:80px;`, css`color: \${args.theme.var.color.base_40};`),
    {
      as: "h1",
      css: SETTINGS_CONSTANTS.TITLE_CSS,
      componentName: "Html",
      text: title,
    },
  ];
}

/**
 * Creates a form submit button with loading state
 * @param text - Button text
 * @param loadingText - Text to show when loading
 * @param onClick - Click handler
 * @returns Submit button schema
 */
export function createFormSubmitButton(
  text: (options: FunctionArgumentType) => string,
  onClick: (options: FunctionArgumentType) => Promise<void>,
) {
  return {
    as: "button",
    css: [STYLES.button2Css, css`width:100%; margin-top:16px;`],
    componentName: "Html",
    props: (options: FunctionArgumentType) => ({
      disabled: options.dataContext.submitState[0]?.isLoading,
      onClick: async () => {
        try {
          options.dataContext.submitState[1]("isLoading", true);
          await onClick(options);
        } finally {
          options.dataContext.submitState[1]("isLoading", false);
        }
      },
      text: text(options),
    }),
    type: "button",
  };
}

/**
 * Creates a link button
 * @param text - Button text
 * @param onClick - Click handler
 * @param css - Additional CSS classes
 * @returns Link button schema
 */
export function createLinkButton(
  text: (options: FunctionArgumentType) => string,
  onClick: (options: FunctionArgumentType) => Promise<void> | void,
  cssString = css`text-align:center; margin-top:16px;`,
) {
  return {
    as: "div",
    attributes: [
      {
        as: "a",
        css: css`
  color: #3b82f6;
  cursor: pointer;
`,
        componentName: "Html",
        props: (options: FunctionArgumentType) => ({
          onClick: async () => {
            if (onClick) {
              await onClick(options);
            }
          },
          text: text(options),
        }),
      },
    ],
    css: cssString,
    componentName: "Html",
  };
}

/**
 * Creates a password field with visibility toggle
 * @param key - Field key
 * @param label - Field label
 * @param showPassword - Password visibility state
 * @param toggleVisibility - Function to toggle visibility
 * @param onEnterKeyHandler - Handler for Enter key press
 * @param setRef - Function to set input ref
 * @returns Password field schema
 */
export function createPasswordField(
  key: string,
  label: string,
  showPassword: Record<string, boolean>,
  toggleVisibility: (field: string) => void,
  onEnterKeyHandler?: (options: FunctionArgumentType) => void,
  setRef?: (ref: HTMLInputElement) => void,
) {
  return [
    {
      as: "div",
      css: [SETTINGS_CONSTANTS.LABEL_CSS, css`margin-top:5px;`],
      componentName: "Html",
      text: label,
    },
    {
      as: "div",
      attributes: [
        {
          css: PROPERTIES.Css.TextFieldCss,
          componentName: "TextInput",
          key,
          props: (options: FunctionArgumentType) => ({
            onInput: (e: Event) => {
              if (e.target instanceof HTMLInputElement) {
                options.updateValue(e.target.value);
              }
            },
            onKeyDown: async (e: KeyboardEvent) => {
              if (e.key === "Enter") {
                if (e.target instanceof HTMLInputElement) {
                  options.updateValue(e.target.value);
                }

                if (options.dataContext.submitState[0]?.isLoading) {
                  return;
                }

                if (onEnterKeyHandler) {
                  onEnterKeyHandler(options);
                }
              }
            },
            onMount: () => {
              if (
                options.ref &&
                options.ref() instanceof HTMLInputElement &&
                setRef
              ) {
                setRef(options.ref());
              }
            },
            ref: setRef,
            type: showPassword[key] ? "text" : "password",
          }),
          validation: { required: true },
        },
        {
          as: "div",
          attributes: [
            {
              componentName: "Icon",
              props: () => ({
                icon: showPassword[key] ? "ph:eye" : "ph:eye-slash",
                onClick: () => toggleVisibility(key),
              }),
            },
          ],
          css: css`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
`,
          componentName: "Html",
        },
      ],
      css: css`
  position: relative;
`,
      componentName: "Html",
    },
    getErrorSchema(key),
  ];
}

/**
 * Creates a submit button
 * @param text - Button text
 * @param isLoading - Loading state
 * @param onClick - Click handler
 * @returns Submit button schema
 */
export function createSubmitButton(
  text: string,
  isLoading: boolean,
  onClick: () => void,
) {
  return {
    as: "button",
    attributes: [
      {
        as: "span",
        componentName: "Html",
        text,
      },
    ],
    css: [STYLES.button2Css, css`width:100%`],
    componentName: "Html",
    props: () => ({
      disabled: isLoading,
      onClick,
      type: "submit",
    }),
  };
}

/**
 * Creates a text area field
 * @param key - Field key
 * @param label - Field label
 * @param rows - Number of rows
 * @param validation - Validation options
 * @returns Text area field schema
 */
export function createTextAreaField(
  key: string,
  label: string,
  rows = 6,
  validation: Record<string, any> = { required: true },
) {
  return [
    {
      as: "div",
      css: [SETTINGS_CONSTANTS.LABEL_CSS, css`margin-top:5px;`],
      componentName: "Html",
      text: label,
    },
    {
      as: "div",
      attributes: [
        {
          css: PROPERTIES.Css.TextFieldCss,
          componentName: "TextArea",
          key,
          props: (options: FunctionArgumentType) => ({
            onChange: options.onChange,
            rows,
            value: options.value ?? "",
          }),
          validation,
        },
      ],
      componentName: "Html",
    },
    getErrorSchema(key),
  ];
}

/**
 * Creates a text input field
 * @param key - Field key
 * @param label - Field label
 * @param onEnterKeyHandler - Handler for Enter key press
 * @param setRef - Function to set input ref
 * @param validation - Validation options
 * @returns Text input field schema
 */
export function createTextField(
  key: string,
  label: string,
  onEnterKeyHandler?: (options: FunctionArgumentType) => void,
  setRef?: (ref: HTMLInputElement) => void,
  validation: Record<string, any> = { required: true },
) {
  return [
    {
      as: "div",
      css: [SETTINGS_CONSTANTS.LABEL_CSS, css`margin-top:5px;`],
      componentName: "Html",
      text: label,
    },
    {
      as: "div",
      attributes: [
        {
          css: PROPERTIES.Css.TextFieldCss,
          componentName: "TextInput",
          key,
          props: (options: FunctionArgumentType) => ({
            onKeyDown: async (e: KeyboardEvent) => {
              if (e.key === "Enter") {
                if (e.target instanceof HTMLInputElement) {
                  options.updateValue(e.target.value);
                }

                if (options.dataContext.submitState[0]?.isLoading) {
                  return;
                }

                if (onEnterKeyHandler) {
                  onEnterKeyHandler(options);
                }
              }
            },
            onMount: () => {
              if (
                options.ref &&
                options.ref() instanceof HTMLInputElement &&
                setRef
              ) {
                setRef(options.ref());
              }
            },
            ref: setRef,
          }),
          validation,
        },
      ],
      componentName: "Html",
    },
    getErrorSchema(key),
  ];
}
