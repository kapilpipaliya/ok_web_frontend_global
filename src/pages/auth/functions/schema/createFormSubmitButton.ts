import type { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";
import { STYLES } from "~/pages/settings/constants";
import { css } from "~/lib/styles";

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
      disabled: options.contextData.submitState[0]?.isLoading,
      onClick: async () => {
        try {
          options.contextData.submitState[1]("isLoading", true);
          await onClick(options);
        } finally {
          options.contextData.submitState[1]("isLoading", false);
        }
      },
      text: text(options),
    }),
    type: "button",
  };
}
